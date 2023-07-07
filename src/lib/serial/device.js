import {LineBreakTransformer} from "$lib/serial/line-break-transformer.js"
import {serialLog} from "$lib/serial/connection.js"

export const VENDOR_ID = 0x239a

/**
 * @returns {Promise<boolean>}
 */
export async function hasSerialPermission() {
  return navigator.serial.getPorts().then(it => it.length > 0)
}

export class CharaDevice {
  /** @type {Promise<SerialPort>} */
  #port
  /** @type {Promise<ReadableStreamDefaultReader<string>>} */
  #reader

  #encoder = new TextEncoder()

  #abortController1 = new AbortController()
  #abortController2 = new AbortController()

  /** @type {Promise<true> | undefined} */
  #lock

  /** @type {Promise<string>} */
  version
  /** @type {Promise<string>} */
  deviceId

  /**
   * @param baudRate
   */
  constructor(baudRate = 115200) {
    this.#port = navigator.serial.getPorts().then(async ports => {
      const port =
        ports.find(it => it.getInfo().usbVendorId === VENDOR_ID) ??
        (await navigator.serial.requestPort({filters: [{usbVendorId: VENDOR_ID}]}))
      await port.open({baudRate})
      const info = port.getInfo()
      serialLog.update(it => {
        it.push({
          type: "system",
          value: `Connected; ID: 0x${info.usbProductId.toString(16)}; Vendor: 0x${info.usbVendorId.toString(
            16,
          )}`,
        })
        return it
      })
      return port
    })
    this.#reader = this.#port.then(async port => {
      const decoderStream = new TextDecoderStream()
      void port.readable.pipeTo(decoderStream.writable, {signal: this.#abortController1.signal})

      return decoderStream.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()), {signal: this.#abortController2.signal})
        .getReader()
    })
    this.#lock = this.#reader.then(() => {
      this.#lock = undefined
      return true
    })
    this.version = this.send("VERSION")
    this.deviceId = this.send("ID")
  }

  /**
   * @returns {Promise<string>}
   */
  async #read() {
    return this.#reader.then(async it => {
      /** @type {string} */
      const result = await it.read().then(({value}) => value)
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
   * @param command {string}
   * @returns {Promise<void>}
   */
  async #send(...command) {
    const port = await this.#port
    const writer = port.writable.getWriter()
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

  /**
   * Read/write to serial port
   * @template T
   * @param callback {(send: (...commands: string) => Promise<void>, read: () => Promise<string>) => T | Promise<T>}
   * @returns Promise<T>
   */
  async runWith(callback) {
    while (this.#lock) {
      await this.#lock
    }
    const send = this.#send.bind(this)
    const read = this.#read.bind(this)
    const exec = new Promise(async resolve => {
      let result
      try {
        result = await callback(send, read)
      } finally {
        this.#lock = undefined
        resolve(result)
      }
    })
    this.#lock = exec.then(() => true)
    return exec
  }

  /**
   * Send to serial port
   * @param command {string}
   * @returns Promise<string>
   */
  async send(...command) {
    return this.runWith(async (send, read) => {
      await send(...command)
      const commandString = command.join(" ").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
      return read().then(it => it.replace(new RegExp(`^${commandString} `), ""))
    })
  }

  /**
   * @returns {Promise<number>}
   */
  async getChordCount() {
    return Number.parseInt(await this.send("CML C0"))
  }

  /**
   * @param index {number}
   * @returns {Promise<{actions: number[]; phrase: string, unk: number}>}
   */
  async getChord(index) {
    const chord = await this.send(`CML C1 ${index}`)
    const [keys, rawPhrase, b] = chord.split(" ")
    let phrase = []
    for (let i = 0; i < rawPhrase.length; i += 2) {
      phrase.push(Number.parseInt(rawPhrase.substring(i, i + 2), 16))
    }
    let bigKeys = BigInt(`0x${keys}`)
    let actions = []
    for (let i = 0; i < 12; i++) {
      const action = Number(bigKeys & BigInt(0b1111111111))
      if (action !== 0) {
        actions.push(action)
      }
      bigKeys >>= BigInt(10)
    }

    return {
      actions,
      phrase: String.fromCodePoint(...phrase),
      unk: Number(b),
    }
  }

  /**
   * @param layer {number}
   * @param id {number}
   * @returns {Promise<number>}
   */
  async getLayoutKey(layer, id) {
    const layout = await this.send(`VAR B3 A${layer} ${id}`)
    const [position] = layout.split(" ").map(Number)
    return position
  }
}
