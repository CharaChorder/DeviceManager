import {LineBreakTransformer} from "$lib/serial/line-break-transformer"
import {serialLog} from "$lib/serial/connection"
import type {Chord} from "$lib/serial/chord"
import {chordFromCommandCompatible} from "$lib/serial/chord"

export const VENDOR_ID = 0x239a

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

  version!: string
  deviceId!: string

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

    const decoderStream = new TextDecoderStream()
    this.streamClosed = this.port.readable!.pipeTo(decoderStream.writable, {
      signal: this.abortController1.signal,
    })

    this.reader = decoderStream
      .readable!.pipeThrough(new TransformStream(new LineBreakTransformer()), {
        signal: this.abortController2.signal,
      })
      .getReader()

    this.version = await this.send("VERSION")
    this.deviceId = await this.send("ID")
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
    await this.disconnect()
    await this.port.forget()
  }

  async disconnect() {
    await this.reader.cancel()
    await this.streamClosed.catch(() => {
      /** noop */
    })
    this.reader.releaseLock()
    await this.port.close()
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
        result = await callback(send, read)
      } finally {
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
      return read().then(it => it.replace(new RegExp(`^${commandString} `), ""))
    })
  }

  async getChordCount(): Promise<number> {
    return Number.parseInt(await this.send("CML C0"))
  }

  async getChord(index: number): Promise<Chord> {
    return chordFromCommandCompatible(await this.send(`CML C1 ${index}`))
  }

  async getLayoutKey(layer: number, id: number) {
    const layout = await this.send(`VAR B3 A${layer} ${id}`)
    const [position] = layout.split(" ").map(Number)
    return position
  }
}
