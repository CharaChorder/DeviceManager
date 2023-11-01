import {LineBreakTransformer} from "$lib/serial/line-break-transformer"
import {serialLog} from "$lib/serial/connection"
import type {Chord} from "$lib/serial/chord"
import {parseChordActions, parsePhrase, stringifyChordActions, stringifyPhrase} from "$lib/serial/chord"
import {browser} from "$app/environment"

export const VENDOR_ID = 0x239a

if (browser && navigator.serial === undefined && import.meta.env.TAURI_FAMILY !== undefined) {
  await import("./tauri-serial")
}

export async function getViablePorts(): Promise<SerialPort[]> {
  return navigator.serial.getPorts().then(ports => ports.filter(it => it.getInfo().usbVendorId === VENDOR_ID))
}

export async function canAutoConnect() {
  return getViablePorts().then(it => it.length === 1)
}

export class CharaDevice {
  private port!: SerialPort
  private reader!: ReadableStreamDefaultReader<string>

  private readonly abortController1 = new AbortController()
  private readonly abortController2 = new AbortController()

  private streamClosed!: Promise<void>

  private lock?: Promise<true>

  version!: [number, number, number]
  company!: "CHARACHORDER"
  device!: "ONE" | "LITE"
  chipset!: "M0" | "S2"

  constructor(private readonly baudRate = 115200) {}

  async init(manual = false) {
    const ports = await getViablePorts()
    this.port =
      !manual && ports.length === 1
        ? ports[0]
        : await navigator.serial.requestPort({filters: [{usbVendorId: VENDOR_ID}]})

    await this.port.open({baudRate: this.baudRate})
    const info = this.port.getInfo()
    serialLog.update(it => {
      it.push({
        type: "system",
        value: `Connected; ID: 0x${info.usbProductId?.toString(16)}; Vendor: 0x${info.usbVendorId?.toString(
          16,
        )}`,
      })
      return it
    })
    await this.port.close()

    const [version] = await this.send("VERSION")
    this.version = version.split(".").map(Number) as [number, number, number]
    const [company, device, chipset] = await this.send("ID")
    this.company = company as "CHARACHORDER"
    this.device = device as "ONE" | "LITE"
    this.chipset = chipset as "M0" | "S2"
  }

  private async suspend() {
    await this.reader.cancel()
    await this.streamClosed.catch(() => {
      /** noop */
    })
    this.reader.releaseLock()
    await this.port.close()
  }

  private async wake() {
    await this.port.open({baudRate: this.baudRate})
    const decoderStream = new TextDecoderStream()
    this.streamClosed = this.port.readable!.pipeTo(decoderStream.writable, {
      signal: this.abortController1.signal,
    })

    this.reader = decoderStream
      .readable!.pipeThrough(new TransformStream(new LineBreakTransformer()), {
        signal: this.abortController2.signal,
      })
      .getReader()
  }

  private async internalRead() {
    const {value} = await this.reader.read()
    serialLog.update(it => {
      it.push({
        type: "output",
        value: value!,
      })
      return it
    })
    return value!
  }

  /**
   * Send a command to the device
   */
  private async internalSend(...command: string[]) {
    const writer = this.port.writable!.getWriter()
    try {
      serialLog.update(it => {
        it.push({
          type: "input",
          value: command.join(" "),
        })
        return it
      })
      await writer.write(new TextEncoder().encode(`${command.join(" ")}\r\n`))
    } finally {
      writer.releaseLock()
    }
  }

  async forget() {
    await this.port.forget()
  }

  /**
   * Read/write to serial port
   */
  async runWith<T>(
    callback: (send: typeof this.internalSend, read: typeof this.internalRead) => T | Promise<T>,
  ): Promise<T> {
    while (this.lock) {
      await this.lock
    }
    const send = this.internalSend.bind(this)
    const read = this.internalRead.bind(this)
    const exec = new Promise<T>(async resolve => {
      let result!: T
      try {
        await this.wake()
        result = await callback(send, read)
      } finally {
        await this.suspend()
        this.lock = undefined
        resolve(result)
      }
    })
    this.lock = exec.then(() => true)
    return exec
  }

  /**
   * Send to serial port
   */
  async send(...command: string[]) {
    return this.runWith(async (send, read) => {
      await send(...command)
      const commandString = command.join(" ").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
      return read().then(it => it.replace(new RegExp(`^${commandString} `), "").split(" "))
    })
  }

  async getChordCount(): Promise<number> {
    const [count] = await this.send("CML C0")
    return Number.parseInt(count)
  }

  /**
   * Retrieves a chord by index
   */
  async getChord(index: number | number[]): Promise<Chord> {
    const [actions, phrase] = await this.send(`CML C1 ${index}`)
    return {
      actions: parseChordActions(actions),
      phrase: parsePhrase(phrase),
    }
  }

  /**
   * Retrieves the phrase for a set of actions
   */
  async getChordPhrase(actions: number[]): Promise<number[] | undefined> {
    const [phrase] = await this.send(`CML C2 ${stringifyChordActions(actions)}`)
    return phrase === "0" ? undefined : parsePhrase(phrase)
  }

  async setChord(chord: Chord) {
    const [status] = await this.send(
      "CML",
      "C3",
      stringifyChordActions(chord.actions),
      stringifyPhrase(chord.phrase),
    )
    if (status !== "0") throw new Error(`Failed with status ${status}`)
  }

  async deleteChord(chord: Pick<Chord, "actions">) {
    const status = await this.send(`CML C4 ${stringifyChordActions(chord.actions)}`)
    if (status.at(-1) !== "0") throw new Error(`Failed with status ${status}`)
  }

  /**
   * Sets an action to the layout
   * @param layer the layer (usually 1-3)
   * @param id id of the key, refer to the individual device for where each key is
   * @param action the assigned action id
   */
  async setLayoutKey(layer: number, id: number, action: number) {
    const [status] = await this.send(`VAR B4 A${layer} ${id} ${action}`)
    console.log(status)
    if (status !== "0") throw new Error(`Failed with status ${status}`)
  }

  /**
   * Gets the assigned action from the layout
   * @param layer the layer (usually 1-3)
   * @param id id of the key, refer to the individual device for where each key is
   * @returns the assigned action id
   */
  async getLayoutKey(layer: number, id: number) {
    const [position, status] = await this.send(`VAR B3 A${layer} ${id}`)
    if (status !== "0") throw new Error(`Failed with status ${status}`)
    return Number(position)
  }

  /**
   * Permanently stores settings and layout to the device.
   *
   * CAUTION: Device may degrade prematurely above 10,000-25,000 commits.
   *
   * **This does not need to be called for chords**
   */
  async commit() {
    const [status] = await this.send("VAR B0")
    if (status !== "0") throw new Error(`Failed with status ${status}`)
  }

  /**
   * Sets a setting on the device.
   *
   * Settings are applied until the next reboot or loss of power.
   * To permanently store the settings, you *must* call commit.
   */
  async setSetting(id: number, value: number) {
    const [status] = await this.send(`VAR B2 ${id} ${value}`)
    if (status !== "0") throw new Error(`Failed with status ${status}`)
  }

  /**
   * Retrieves a setting from the device
   */
  async getSetting(id: number): Promise<number> {
    const [value, status] = await this.send(`VAR B1 ${id}`)
    if (status !== "0") throw new Error(`Setting "${id}" doesn't exist (Status code ${status})`)
    return Number(value)
  }

  /**
   * Reboots the device
   */
  async reboot() {
    await this.send("RST")
    // TODO: reconnect
  }

  /**
   * Reboots the device to the bootloader
   */
  async bootloader() {
    await this.send("RST BOOTLOADER")
    // TODO: more...
  }

  /**
   * Returns the current number of bytes available in SRAM.
   *
   * This is useful for debugging when there is a suspected heap or stack issue.
   */
  async getRamBytesAvailable(): Promise<number> {
    return Number(await this.send("RAM"))
  }
}
