import {readGetOneAndToss} from "$lib/serial/webserial/noop.js"

export let FIRMWARE_VERSION = "0"

/**
 * @param lineReader {ReadableStreamDefaultReader<string>}
 * @returns {Promise<void>}
 */
export async function readVersion(lineReader) {
  await readGetOneAndToss(lineReader) //electronics board version
  const {value, done} = await lineReader.read()
  if (value) {
    FIRMWARE_VERSION = value
    console.log("Firmware Version:", FIRMWARE_VERSION)
  }
  await readGetOneAndToss(lineReader) //serial api version
}
