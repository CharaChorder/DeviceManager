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
  private readonly port: Promise<SerialPort>
  private readonly reader: Promise<ReadableStreamDefaultReader<string>>

  private readonly abortController1 = new AbortController()
  private readonly abortController2 = new AbortController()

  private lock?: Promise<true>

  version: Promise<string>
  deviceId: Promise<string>

  constructor(baudRate = 115200) {
    this.port = getViablePorts().then(async ports => {
      const port =
        ports.length === 1
          ? ports[0]
          : await navigator.serial.requestPort({filters: [{usbVendorId: VENDOR_ID}]})
      await port.open({baudRate})
      const info = port.getInfo()
      serialLog.update(it => {
        it.push({
          type: "system",
          value: `Connected; ID: 0x${info.usbProductId?.toString(16)}; Vendor: 0x${info.usbVendorId?.toString(
            16,
          )}`,
        })
        return it
      })
      return port
    })
    this.reader = this.port.then(async port => {
      const decoderStream = new TextDecoderStream()
      void port.readable!.pipeTo(decoderStream.writable, {signal: this.abortController1.signal})

      return decoderStream
        .readable!.pipeThrough(new TransformStream(new LineBreakTransformer()), {
          signal: this.abortController2.signal,
        })
        .getReader()
    })
    this.lock = this.reader.then(() => {
      delete this.lock
      return true
    })
    this.version = this.send("VERSION")
    this.deviceId = this.send("ID")
  }

  private async internalRead() {
    return this.reader.then(async it => {
      const result: string = await it.read().then(({value}) => value!)
      serialLog.update(it => {
        it.push({
          type: "output",
          value: result,
        })
        return it
      })
      return result
    })
  }

  /**
   * Send a command to the device
   */
  private async internalSend(...command: string[]) {
    const port = await this.port
    const writer = port.writable!.getWriter()
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

  async ready() {
    await this.port
  }

  async forget() {
    await (await this.port).forget()
  }

  async disconnect() {
    this.abortController1.abort()
    this.abortController2.abort()
    ;(await this.reader).releaseLock()
    await (await this.port).close()
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
