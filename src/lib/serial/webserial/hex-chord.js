import {readGetOneAndToss} from "$lib/serial/webserial/noop.js"

/**
 * Unused?
 * @param lineReader {ReadableStreamDefaultReader<string>}
 * @returns {Promise<string>}
 */
export async function readGetHexChord(lineReader) {
  let hexChordString = ""
  await readGetOneAndToss(lineReader) //this is added for the latest firmware with customers, where decimal version

  const {value, done} = await lineReader.read()
  if (done) {
    console.log("reader is done")
  } else {
    console.log(["value", value])

    if (value) {
      let arrValue = [...value]
      const strValue = String(arrValue.join(""))
      console.log(strValue)
      hexChordString = strValue.substr(0, 16)
      await readGetOneAndToss(lineReader) // the "processing chord:" decimal output
    }
  }
  return hexChordString
}
