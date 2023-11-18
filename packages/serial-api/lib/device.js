import { LineBreakTransformer } from "./line-break-transformer.js";
import { SemVer } from "./sem-ver.js";
import {
  parseChordInput,
  parseChordOutput,
  stringifyChordInput,
  stringifyChordOutput,
} from "./chord.js";
import { browser } from "$app/environment";

/** @type {Map<string, SerialPortFilter>} */
const PORT_FILTERS = new Map([
  ["ONE M0", { usbProductId: 32783, usbVendorId: 9114 }],
  ["LITE S2", { usbProductId: 33070, usbVendorId: 12346 }],
  ["LITE M0", { usbProductId: 32796, usbVendorId: 9114 }],
  ["X", { usbProductId: 33163, usbVendorId: 12346 }],
]);

if (
  browser &&
  navigator.serial === undefined &&
  import.meta.env.TAURI_FAMILY !== undefined
) {
  await import("../../../apps/manager/src/lib/serial/tauri-serial");
}

/**
 * @returns {Promise<SerialPort[]>}
 */
export async function getViablePorts() {
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

export async function canAutoConnect() {
  return getViablePorts().then((it) => it.length === 1);
}

/**
 * @typedef {import('./types.js').TypedEventTarget<{
 *   'send': CustomEvent<string>,
 *   'read': CustomEvent<string>,
 *   'connected': Event,
 * }>} DeviceEventTarget
 */
const CharaDeviceEventTarget = /** @type {DeviceEventTarget} */ (EventTarget);

export class CharaDevice extends CharaDeviceEventTarget {
  /**
   * @private
   * @type {SerialPort}
   */
  port;

  /**
   * @private
   * @type {ReadableStreamDefaultReader<string>}
   */
  reader;

  abortController1 = new AbortController();
  abortController2 = new AbortController();

  /**
   * @private
   * @type {Promise<void>}
   */
  streamClosed;

  /**
   * @private
   * @type {Promise<true> | undefined}
   */
  lock;

  /**
   * @type {SemVer}
   */
  version;

  /** @type {'CHARACHORDER'} */
  company;

  /** @type {'ONE' | 'LITE' | 'X'} */
  device;

  /** @type {'M0' | 'S2'} */
  chipset;

  /** @type {90 | 67} */
  keyCount;

  constructor(baudRate = 115200) {
    super();
    this.baudRate = baudRate;
  }

  async init(manual = false) {
    const ports = await getViablePorts();
    this.port =
      !manual && ports.length === 1
        ? ports[0]
        : await navigator.serial.requestPort({
            filters: [...PORT_FILTERS.values()],
          });

    this.version = new SemVer(
      await this.send("VERSION").then(([version]) => version),
    );
    const [company, device, chipset] = await this.send("ID");
    this.company = company;
    this.device = device;
    this.chipset = chipset;
    this.keyCount = this.device === "ONE" ? 90 : 67;
    this.dispatchEvent(new Event("connected"));
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async suspend() {
    await this.reader.cancel();
    await this.streamClosed.catch(() => {
      /** noop */
    });
    this.reader.releaseLock();
    await this.port.close();
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async wake() {
    await this.port.open({ baudRate: this.baudRate });
    const decoderStream = new TextDecoderStream();
    this.streamClosed = this.port.readable.pipeTo(decoderStream.writable, {
      signal: this.abortController1.signal,
    });

    this.reader = decoderStream.readable
      .pipeThrough(new TransformStream(new LineBreakTransformer()), {
        signal: this.abortController2.signal,
      })
      .getReader();
  }

  /**
   * @private
   * @returns {Promise<string>}
   */
  async internalRead() {
    const { value } = await this.reader.read();
    this.dispatchEvent(new CustomEvent("read", { detail: value }));
    return value;
  }

  /**
   * Send a command to the device
   * @private
   * @param command {string}
   */
  async internalSend(...command) {
    const writer = this.port.writable.getWriter();
    try {
      this.dispatchEvent(
        new CustomEvent("send", { detail: command.join(" ") }),
      );
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
   * @template T
   * @callback callback {(send: typeof this.internalSend, read: typeof this.internalRead) => T | Promise<T>}
   * @returns {Promise<T>}
   */
  async runWith(callback) {
    while (this.lock) {
      await this.lock;
    }
    const send = this.internalSend.bind(this);
    const read = this.internalRead.bind(this);
    /** @type {Promise<T>} */
    const exec = new Promise(async (resolve) => {
      /** @type {T} */
      let result;
      try {
        await this.wake();
        result = await callback(send, read);
      } finally {
        await this.suspend();
        this.lock = undefined;
        resolve(result);
      }
    });
    this.lock = exec.then(() => true);
    return exec;
  }

  /**
   * Send to serial port
   * @param command {string}
   */
  async send(...command) {
    return this.runWith(async (send, read) => {
      await send(...command);
      const commandString = command
        .join(" ")
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      return read().then((it) =>
        it.replace(new RegExp(`^${commandString} `), "").split(" "),
      );
    });
  }

  /**
   * @returns {Promise<number>}
   */
  async getChordCount() {
    const [count] = await this.send("CML C0");
    return Number.parseInt(count);
  }

  /**
   * Retrieves a chord by index
   * @param index {number | number[]}
   * @returns {Promise<import('./types.js').Chord>}
   */
  async getChord(index) {
    const [actions, phrase] = await this.send(`CML C1 ${index}`);
    return {
      input: parseChordInput(actions),
      output: parseChordOutput(phrase),
    };
  }

  /**
   * Retrieves the phrase for a set of actions
   * @param input {number[]}
   * @returns {Promise<number[] | undefined>}
   */
  async getChordOutput(input) {
    const [phrase] = await this.send(`CML C2 ${stringifyChordInput(input)}`);
    return phrase === "2" ? undefined : parseChordOutput(phrase);
  }

  /**
   * @param chord {import('./types.js').Chord}
   * @returns {Promise<void>}
   */
  async setChord(chord) {
    const [status] = await this.send(
      "CML",
      "C3",
      stringifyChordInput(chord.input),
      stringifyChordOutput(chord.input),
    );
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * @param chord {Pick<import('./types.js').Chord, 'input'>}
   * @returns {Promise<void>}
   */
  async deleteChord(chord) {
    const status = await this.send(
      `CML C4 ${stringifyChordInput(chord.input)}`,
    );
    console.log(status);
    if (status.at(-1) !== "2") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Sets an action to the layout
   * @param layer {number} the layer (usually 1-3)
   * @param id {number} id of the key, refer to the individual device for where each key is
   * @param action {number} the assigned action id
   * @returns {Promise<void>}
   */
  async setLayoutKey(layer, id, action) {
    const [status] = await this.send(`VAR B4 A${layer} ${id} ${action}`);
    console.log(status);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Gets the assigned action from the layout
   * @param layer {number} the layer (usually 1-3)
   * @param id {number} id of the key, refer to the individual device for where each key is
   * @returns {Promise<number>} the assigned action id
   */
  async getLayoutKey(layer, id) {
    const [position, status] = await this.send(`VAR B3 A${layer} ${id}`);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
    return Number(position);
  }

  /**
   * Permanently stores settings and layout to the device.
   *
   * CAUTION: Device may degrade prematurely above 10,000-25,000 commits.
   *
   * **This does not need to be called for chords**
   *
   * @returns {Promise<void>}
   */
  async commit() {
    const [status] = await this.send("VAR B0");
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Sets a setting on the device.
   *
   * Settings are applied until the next reboot or loss of power.
   * To permanently store the settings, you *must* call commit.
   * @param id {number}
   * @param value {number}
   * @returns {Promise<void>}
   */
  async setSetting(id, value) {
    const [status] = await this.send(`VAR B2 ${id} ${value}`);
    if (status !== "0") throw new Error(`Failed with status ${status}`);
  }

  /**
   * Retrieves a setting from the device
   * @param id {number}
   * @returns {Promise<number>}
   */
  async getSetting(id) {
    const [value, status] = await this.send(`VAR B1 ${id}`);
    if (status !== "0")
      throw new Error(`Setting "${id}" doesn't exist (Status code ${status})`);
    return Number(value);
  }

  /**
   * Reboots the device
   * @returns {Promise<void>}
   */
  async reboot() {
    await this.send("RST");
    // TODO: reconnect
  }

  /**
   * Reboots the device to the bootloader
   * @returns {Promise<void>}
   */
  async bootloader() {
    await this.send("RST BOOTLOADER");
    // TODO: more...
  }

  /**
   * Returns the current number of bytes available in SRAM.
   *
   * This is useful for debugging when there is a suspected heap or stack issue.
   * @returns {Promise<number>}
   */
  async getRamBytesAvailable() {
    return Number(await this.send("RAM"));
  }
}
