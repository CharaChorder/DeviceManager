import {LineBreakTransformer} from "$lib/serial/line-break-transformer"
import {serialLog} from "$lib/serial/connection"
import type {Chord} from "$lib/serial/chord"
import {SemVer} from "$lib/serial/sem-ver"
import {parseChordActions, parsePhrase, stringifyChordActions, stringifyPhrase} from "$lib/serial/chord"
import {browser} from "$app/environment"

const PORT_FILTERS: Map<string, SerialPortFilter> = new Map([
  ["ONE M0", {usbProductId: 32783, usbVendorId: 9114}],
  ["LITE S2", {usbProductId: 33070, usbVendorId: 12346}],
  ["LITE M0", {usbProductId: 32796, usbVendorId: 9114}],
  ["X", {usbProductId: 33163, usbVendorId: 12346}],
])

const KEY_COUNTS = {
  ONE: 90,
  LITE: 67,
  X: 256,
} as const

if (browser && navigator.serial === undefined && import.meta.env.TAURI_FAMILY !== undefined) {
  await import("./tauri-serial")
}

export async function getViablePorts(): Promise<SerialPort[]> {
  return navigator.serial.getPorts().then(ports =>
    ports.filter(it => {
      const {usbProductId, usbVendorId} = it.getInfo()
      for (const filter of PORT_FILTERS.values()) {
        if (filter.usbProductId === usbProductId && filter.usbVendorId === usbVendorId) {
          return true
        }
      }
      return false
    }),
  )
}

export async function canAutoConnect() {
  return getViablePorts().then(it => it.length === 1)
}

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: number
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Timeout")), ms) as unknown as number
    }),
  ]).finally(() => clearTimeout(timer))
}

export class CharaDevice {
  private port!: SerialPort
  private reader!: ReadableStreamDefaultReader<string>

  private readonly abortController1 = new AbortController()
  private readonly abortController2 = new AbortController()

  private streamClosed!: Promise<void>

  private lock?: Promise<true>

  private readonly suspendDebounce = 100
  private suspendDebounceId?: number

  version!: SemVer
  company!: "CHARACHORDER"
  device!: "ONE" | "LITE" | "X"
  chipset!: "M0" | "S2"
  keyCount!: 90 | 67 | 256

  get portInfo() {
    return this.port.getInfo()
  }

  constructor(private readonly baudRate = 115200) {}

  async init(manual = false) {
    try {
      const ports = await getViablePorts()
      this.port =
        !manual && ports.length === 1
          ? ports[0]
          : await navigator.serial.requestPort({filters: [...PORT_FILTERS.values()]})

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

      this.version = new SemVer(await this.send("VERSION").then(([version]) => version))
      const [company, device, chipset] = await this.send("ID")
      this.company = company as "CHARACHORDER"
      this.device = device as "ONE" | "LITE" | "X"
      this.chipset = chipset as "M0" | "S2"
      this.keyCount = KEY_COUNTS[this.device]
    } catch (e) {
      alert(e)
      console.error(e)
      throw e
    }
  }

  private async suspend() {
    await this.reader.cancel()
    await this.streamClosed.catch(() => {
      /** noop */
    })
    this.reader.releaseLock()
    await this.port.close()
    serialLog.update(it => {
      it.push({
        type: "system",
        value: "Connection suspended",
      })
      return it
    })
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
    serialLog.update(it => {
      it.push({
        type: "system",
        value: "Connection resumed",
      })
      return it
    })
  }

  private async internalRead() {
    try {
      const {value} = await timeout(this.reader.read(), 5000)
      serialLog.update(it => {
        it.push({
          type: "output",
          value: value!,
        })
        return it
      })
      return value!
    } catch (e) {
      serialLog.update(it => {
        it.push({
          type: "output",
          value: `${e}`,
        })
        return it
      })
    }
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
    let resolveLock: (result: true) => void
    this.lock = new Promise<true>(resolve => {
      resolveLock = resolve
    })
    let result!: T
    try {
      if (this.suspendDebounceId) {
        clearTimeout(this.suspendDebounceId)
      } else {
        await this.wake()
      }
      result = await callback(send, read)
    } finally {
      delete this.lock
      this.suspendDebounceId = setTimeout(() => {
        // cannot be locked here as all the code until clearTimeout is sync
        console.assert(this.lock === undefined)
        this.lock = this.suspend().then(() => {
          delete this.lock
          delete this.suspendDebounceId
          return true
        })
      }, this.suspendDebounce) as any
      resolveLock!(true)
      return result
    }
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
    return phrase === "2" ? undefined : parsePhrase(phrase)
  }

  async setChord(chord: Chord) {
    const [status] = await this.send(
      "CML",
      "C3",
      stringifyChordActions(chord.actions),
      stringifyPhrase(chord.phrase),
    )
    if (status !== "0") console.error(`Failed with status ${status}`)
  }

  async deleteChord(chord: Pick<Chord, "actions">) {
    const status = await this.send(`CML C4 ${stringifyChordActions(chord.actions)}`)
    console.log(status)
    if (status.at(-1) !== "2" && status.at(-1) !== "0") throw new Error(`Failed with status ${status}`)
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
    const [status] = await this.send(`VAR B2 ${id.toString(16).toUpperCase()} ${value}`)
    if (status !== "0") throw new Error(`Failed with status ${status}`)
  }

  /**
   * Retrieves a setting from the device
   */
  async getSetting(id: number): Promise<number> {
    const [value, status] = await this.send(`VAR B1 ${id.toString(16).toUpperCase()}`)
    if (status !== "0")
      throw new Error(`Setting "0x${id.toString(16)}" doesn't exist (Status code ${status})`)
    return Number(value)
  }

  /**
   * Reboots the device
   */
  async reboot() {
    await this.send("RST")
  }

  /**
   * Reboots the device to the bootloader
   */
  async bootloader() {
    await this.send("RST BOOTLOADER")
  }

  /**
   * Resets the device
   */
  async reset(type: "FACTORY" | "PARAMS" | "KEYMAPS" | "STARTER" | "CLEARCML" | "FUNC") {
    await this.send(`RST ${type}`)
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
