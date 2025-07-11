import { LineBreakTransformer } from "$lib/serial/line-break-transformer";
import { serialLog } from "$lib/serial/connection";
import type { Chord } from "$lib/serial/chord";
import {
  parseChordActions,
  parsePhrase,
  stringifyChordActions,
  stringifyPhrase,
} from "$lib/serial/chord";
import { browser } from "$app/environment";
import { showConnectionFailedDialog } from "$lib/dialogs/connection-failed-dialog";
import semverGte from "semver/functions/gte";

const PORT_FILTERS: Map<string, SerialPortFilter> = new Map([
  ["ONE M0", { usbProductId: 32783, usbVendorId: 9114 }],
  ["TWO S3 (pre-production)", { usbProductId: 0x8252, usbVendorId: 0x303a }],
  ["TWO S3", { usbProductId: 0x8253, usbVendorId: 0x303a }],
  ["LITE S2", { usbProductId: 0x812e, usbVendorId: 0x303a }],
  ["LITE M0", { usbProductId: 32796, usbVendorId: 9114 }],
  ["X", { usbProductId: 0x818b, usbVendorId: 0x303a }],
  ["M4G S3 (pre-production)", { usbProductId: 0x1001, usbVendorId: 0x303a }],
  ["M4G S3", { usbProductId: 0x829a, usbVendorId: 0x303a }],
]);

const KEY_COUNTS = {
  ONE: 90,
  TWO: 90,
  LITE: 67,
  X: 256,
  M4G: 90,
  M4GR: 90,
} as const;

if (
  browser &&
  navigator.serial === undefined &&
  import.meta.env.TAURI_FAMILY !== undefined
) {
  await import("./tauri-serial");
}

if (browser && navigator.serial === undefined && navigator.usb !== undefined) {
  // @ts-expect-error polyfill
  navigator.serial = await import("web-serial-polyfill").then(
    ({ serial }) => serial,
  );
}

export async function getViablePorts(): Promise<SerialPort[]> {
  return navigator.serial.getPorts().then((ports) =>
    ports.filter((it) => {
      const { usbProductId, usbVendorId } = it.getInfo();
      for (const filter of PORT_FILTERS.values()) {
        if (
          filter.usbProductId === usbProductId &&
          filter.usbVendorId === usbVendorId
        ) {
          return true;
        }
      }
      return false;
    }),
  );
}

type LengthArray<T, N extends number, R extends T[] = []> = number extends N
  ? T[]
  : R["length"] extends N
    ? R
    : LengthArray<T, N, [T, ...R]>;

export async function canAutoConnect() {
  return getViablePorts().then((it) => it.length === 1);
}

async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: number;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Timeout")),
        ms,
      ) as unknown as number;
    }),
  ]).finally(() => clearTimeout(timer));
}

export class CharaDevice {
  private port!: SerialPort;
  private reader!: ReadableStreamDefaultReader<string>;

  private readonly abortController1 = new AbortController();
  private readonly abortController2 = new AbortController();

  private streamClosed!: Promise<void>;

  private lock?: Promise<true>;

  private readonly suspendDebounce = 100;
  private suspendDebounceId?: number;

  version!: string;
  company!: "CHARACHORDER" | "FORGE";
  device!: "ONE" | "TWO" | "LITE" | "X" | "M4G";
  chipset!: "M0" | "S2" | "S3";
  keyCount!: 90 | 67 | 256;
  layerCount = 3;
  profileCount = 1;

  get portInfo() {
    return this.port.getInfo();
  }

  constructor(private readonly baudRate = 115200) {}

  async init(manual = false) {
    try {
      const ports = await getViablePorts();
      this.port =
        !manual && ports.length === 1
          ? ports[0]!
          : await navigator.serial.requestPort({
              filters: [...PORT_FILTERS.values()],
            });

      await this.port.open({ baudRate: this.baudRate });
      const info = this.port.getInfo();
      serialLog.update((it) => {
        it.push({
          type: "system",
          value: `Connected; ID: 0x${info.usbProductId?.toString(
            16,
          )}; Vendor: 0x${info.usbVendorId?.toString(16)}`,
        });
        return it;
      });
      await this.port.close();

      this.version = await this.send(1, ["VERSION"]).then(
        ([version]) => version,
      );
      if (semverGte(this.version, "2.2.0-beta.4")) {
        this.profileCount = 3;
      }
      const [company, device, chipset] = await this.send(3, ["ID"]);
      this.company = company as typeof this.company;
      this.device = device as typeof this.device;
      this.chipset = chipset as typeof this.chipset;
      this.keyCount = KEY_COUNTS[this.device];
    } catch (e) {
      console.error(e);
      await showConnectionFailedDialog(String(e));
    }
  }

  private async suspend() {
    await this.reader.cancel();
    await this.streamClosed.catch(() => {
      /** noop */
    });
    this.reader.releaseLock();
    await this.port.close();
    serialLog.update((it) => {
      it.push({
        type: "system",
        value: "Connection suspended",
      });
      return it;
    });
  }

  private async wake() {
    await this.port.open({ baudRate: this.baudRate });
    const decoderStream = new TextDecoderStream();
    this.streamClosed = this.port.readable!.pipeTo(decoderStream.writable, {
      signal: this.abortController1.signal,
    });

    this.reader = decoderStream
      .readable!.pipeThrough(new TransformStream(new LineBreakTransformer()), {
        signal: this.abortController2.signal,
      })
      .getReader();
    serialLog.update((it) => {
      it.push({
        type: "system",
        value: "Connection resumed",
      });
      return it;
    });
  }

  private async internalRead(timeoutMs: number | undefined) {
    try {
      const { value } =
        timeoutMs !== undefined
          ? await timeout(this.reader.read(), timeoutMs)
          : await this.reader.read();
      serialLog.update((it) => {
        it.push({
          type: "output",
          value: value!,
        });
        return it;
      });
      return value!;
    } catch (e) {
      serialLog.update((it) => {
        it.push({
          type: "output",
          value: `${e}`,
        });
        return it;
      });
    }
    return undefined;
  }

  /**
   * Send a command to the device
   */
  private async internalSend(...command: string[]) {
    const writer = this.port.writable!.getWriter();
    try {
      serialLog.update((it) => {
        it.push({
          type: "input",
          value: command.join(" "),
        });
        return it;
      });
      await writer.write(new TextEncoder().encode(`${command.join(" ")}\r\n`));
    } finally {
      writer.releaseLock();
    }
  }

  async forget() {
    await this.port.forget();
  }

  /**
   * Read/write to serial port
   */
  async runWith<T>(
    callback: (
      send: typeof this.internalSend,
      read: typeof this.internalRead,
    ) => T | Promise<T>,
  ): Promise<T> {
    while (this.lock) {
      await this.lock;
    }
    const send = this.internalSend.bind(this);
    const read = this.internalRead.bind(this);
    let resolveLock: (result: true) => void;
    this.lock = new Promise<true>((resolve) => {
      resolveLock = resolve;
    });
    let result!: T;
    try {
      if (this.suspendDebounceId) {
        clearTimeout(this.suspendDebounceId);
      } else {
        await this.wake();
      }
      result = await callback(send, read);
    } finally {
      delete this.lock;
      this.suspendDebounceId = setTimeout(() => {
        // cannot be locked here as all the code until clearTimeout is sync
        console.assert(this.lock === undefined);
        this.lock = this.suspend().then(() => {
          delete this.lock;
          delete this.suspendDebounceId;
          return true;
        });
      }, this.suspendDebounce) as any;
      resolveLock!(true);
      return result;
    }
  }

  /**
   * Send to serial port
   */
  async send<T extends number>(
    expectedLength: T,
    command: string[],
    timeout: number | undefined = 5000,
  ): Promise<LengthArray<string, T>> {
    return this.runWith(async (send, read) => {
      await send(...command);
      const commandString = command
        .join(" ")
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const readResult = await read(timeout);
      if (readResult === undefined) {
        console.error("No response");
        return Array(expectedLength).fill("NO_RESPONSE") as LengthArray<
          string,
          T
        >;
      }
      const array = readResult
        .replace(new RegExp(`^${commandString} `), "")
        .split(" ");
      if (array.length < expectedLength) {
        console.error("Response too short");
        return array.concat(
          Array(expectedLength - array.length).fill("TOO_SHORT"),
        ) as LengthArray<string, T>;
      }
      return array as LengthArray<string, T>;
    });
  }

  async getChordCount(): Promise<number> {
    const [count] = await this.send(1, ["CML", "C0"]);
    return Number.parseInt(count);
  }

  /**
   * Retrieves a chord by index
   */
  async getChord(index: number | number[]): Promise<Chord> {
    const [actions, phrase] = await this.send(2, [
      "CML",
      "C1",
      index.toString(),
    ]);
    return {
      actions: parseChordActions(actions),
      phrase: parsePhrase(phrase),
    };
  }

  /**
   * Retrieves the phrase for a set of actions
   */
  async getChordPhrase(actions: number[]): Promise<number[] | undefined> {
    const [phrase] = await this.send(1, [
      "CML",
      "C2",
      stringifyChordActions(actions),
    ]);
    return phrase === "2" ? undefined : parsePhrase(phrase);
  }

  async setChord(chord: Chord) {
    const [status] = await this.send(1, [
      "CML",
      "C3",
      stringifyChordActions(chord.actions),
      stringifyPhrase(chord.phrase),
    ]);
    if (status !== "0") console.error(`Failed with status ${status}`);
  }

  async deleteChord(chord: Pick<Chord, "actions">) {
    const status = await this.send(1, [
      "CML",
      "C4",
      stringifyChordActions(chord.actions),
    ]);
    if (status?.at(-1) !== "2" && status?.at(-1) !== "0")
      throw new Error(`Failed with status ${status}`);
  }

  /**
   * Sets an action to the layout
   * @param layer the layer (usually 1-3)
   * @param id id of the key, refer to the individual device for where each key is
   * @param action the assigned action id
   */
  async setLayoutKey(
    profile: number,
    layer: number,
    id: number,
    action: number,
  ) {
    const [status] = await this.send(1, [
      "VAR",
      "B4",
      `${String.fromCodePoint("A".codePointAt(0)! + profile)}${layer}`,
      id.toString(),
      action.toString(),
    ]);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Gets the assigned action from the layout
   * @param layer the layer (usually 1-3)
   * @param id id of the key, refer to the individual device for where each key is
   * @returns the assigned action id
   */
  async getLayoutKey(profile: number, layer: number, id: number) {
    const [position, status] = await this.send(2, [
      "VAR",
      "B3",
      `${String.fromCodePoint("A".codePointAt(0)! + profile)}${layer}`,
      id.toString(),
    ]);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
    return Number(position);
  }

  /**
   * Permanently stores settings and layout to the device.
   *
   * CAUTION: Device may degrade prematurely above 10,000-25,000 commits.
   *
   * **This does not need to be called for chords**
   */
  async commit() {
    const [status] = await this.send(1, ["VAR", "B0"]);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Sets a setting on the device.
   *
   * Settings are applied until the next reboot or loss of power.
   * To permanently store the settings, you *must* call commit.
   */
  async setSetting(profile: number, id: number, value: number) {
    const [status] = await this.send(1, [
      "VAR",
      "B2",
      (id + profile * 0x100).toString(16).toUpperCase(),
      value.toString(),
    ]);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Retrieves a setting from the device
   */
  async getSetting(profile: number, id: number): Promise<number> {
    const [value, status] = await this.send(2, [
      "VAR",
      "B1",
      (id + profile * 0x100).toString(16).toUpperCase(),
    ]);
    if (status !== "0")
      throw new Error(
        `Setting "0x${id.toString(16)}" doesn't exist (Status code ${status})`,
      );
    return Number(value);
  }

  /**
   * Reboots the device
   */
  async reboot() {
    await this.send(0, ["RST"]);
  }

  /**
   * Reboots the device to the bootloader
   */
  async bootloader() {
    await this.send(0, ["RST", "BOOTLOADER"]);
  }

  /**
   * Resets the device
   */
  async reset(
    type: "FACTORY" | "PARAMS" | "KEYMAPS" | "STARTER" | "CLEARCML" | "FUNC",
  ) {
    await this.send(0, ["RST", type]);
  }

  async queryKey(): Promise<number> {
    const [value] = await this.send(1, ["QRY", "KEY"], undefined);
    return Number(value);
  }

  /**
   * Returns the current number of bytes available in SRAM.
   *
   * This is useful for debugging when there is a suspected heap or stack issue.
   */
  async getRamBytesAvailable(): Promise<number> {
    return Number(await this.send(1, ["RAM"]).then(([bytes]) => bytes));
  }

  async updateFirmware(
    file: ArrayBuffer,
    progress: (transferred: number, total: number) => void,
  ): Promise<void> {
    while (this.lock) {
      await this.lock;
    }

    let resolveLock: (result: true) => void;
    this.lock = new Promise<true>((resolve) => {
      resolveLock = resolve;
    });
    try {
      if (this.suspendDebounceId) {
        clearTimeout(this.suspendDebounceId);
      } else {
        await this.wake();
      }

      serialLog.update((it) => {
        it.push({
          type: "system",
          value: "OTA Update",
        });
        return it;
      });

      const writer = this.port.writable!.getWriter();
      try {
        await writer.write(new TextEncoder().encode(`RST OTA\r\n`));
        serialLog.update((it) => {
          it.push({
            type: "input",
            value: "RST OTA",
          });
          return it;
        });

        // Wait for the device to be ready
        const signal = await this.reader.read();
        serialLog.update((it) => {
          it.push({
            type: "output",
            value: signal.value!.trim(),
          });
          return it;
        });

        const chunkSize = 128;
        for (let i = 0; i < file.byteLength; i += chunkSize) {
          const chunk = file.slice(i, i + chunkSize);
          await writer.write(new Uint8Array(chunk));
          progress(i + chunk.byteLength, file.byteLength);
        }

        serialLog.update((it) => {
          it.push({
            type: "input",
            value: `...${file.byteLength} bytes`,
          });
          return it;
        });

        const result = (await this.reader.read()).value!.trim();
        serialLog.update((it) => {
          it.push({
            type: "output",
            value: result!,
          });
          return it;
        });

        if (result !== "OTA OK") {
          throw new Error(result);
        }

        await writer.write(new TextEncoder().encode(`RST RESTART\r\n`));
        serialLog.update((it) => {
          it.push({
            type: "input",
            value: "RST RESTART",
          });
          return it;
        });
      } finally {
        writer.releaseLock();
      }

      await this.suspend();
    } finally {
      delete this.lock;
      resolveLock!(true);
    }
  }
}
