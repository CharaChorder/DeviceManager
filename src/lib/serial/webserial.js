import {LineBreakTransformer} from "$lib/serial/webserial/util/line-break-transformer.js"
import {CONFIG_ID} from "$lib/serial/webserial/constants/config-id.js"
let _chordMaps = []

let serialPort = null
let portReader = null
let lineReader = null
let lineReaderDone = null
let abortController1 = new AbortController()
let abortController2 = new AbortController()

async function disconnectSerialConnection() {
  console.log("disconnectSerialConnection()")
  if (serialPort) {
    console.log("closing serial port")
    lineReader.releaseLock()

    console.log(serialPort.readable)
    await abortController1.abort()
    await lineReaderDone.catch(() => {
      /* Ingore the error */
    })
    await serialPort.close()

    console.log("serial port is closed")
    document.getElementById("statusDiv").innerHTML = "status: closed serial port"
  } else {
    console.log("there is no serial connection open to close")
  }
}

//TODO not sure this actually works
async function cancelReader() {
  if (serialPort) {
    if (lineReader) {
      // if(lineReader.locked){
      await lineReader.cancel().then(() => {
        console.log("cleared line reader")
      })
      // await serialPort.readable.releaseLock();
      console.log(abortController1)
      await abortController1.abort()
      console.log(serialPort.readable)
      await lineReaderDone.catch(() => {
        /* Ingore the error */
      }) //this frees up the serialPort.readable after the abortControl1.abort() signal
      // await serialPort.readable.cancel();
      // }
    }
  }
}

async function resetReader() {
  console.log("resetting lineReader")
  if (serialPort) {
    if (lineReader) {
      if (lineReader.locked) {
        await lineReader.releaseLock()
      }
      await lineReader.cancel().then(() => {
        console.log("cleared line reader")
      })
      await lineReaderDone.catch(() => {
        /* Ingore the error */
      })
    }
    await setupLineReader()
  }
  console.log("reset lineReader")
}

async function getCount() {
  await sendCommandString("SELECT BASE")
  await readGetChordmapCount()
  document.getElementById("countDiv").innerHTML = "count: " + _chordmapCountOnDevice
}

async function getGetAll1() {
  await selectBase() //select BASE
  await sendCommandString("GETALL")
  await readGetAllChordmaps()
}

async function getGetAll2() {
  await selectBase() //select BASE
  await sendCommandString("GETSOME 0 " + _chordmapCountOnDevice)
  await readGetSomeChordmaps(_chordmapCountOnDevice)
}

async function getGetAll() {
  await selectBase() //select BASE
  for (let i = 0; i < _chordmapCountOnDevice; i++) {
    await sendCommandString("GETSOME " + (i + 0).toString() + " " + (i + 1).toString())
    await readGetOneChordmap()
  }
}

let _chordmapId = "DEFAULT"
let _chordmapCountOnDevice = 50 //TODO set this to zero by default
let _firmwareVersion = "0"

async function readGetChordmapCount() {
  const {value, done} = await lineReader.read()
  if (value) {
    _chordmapCountOnDevice = parseInt(value)
    console.log(_chordmapCountOnDevice)
  }
}

async function readGetAll() {
  readGetSomeChordmaps(_chordmapCountOnDevice)
}

function commitAll() {
  console.log("commitAll()")
  const dataTable = document.getElementById("dataTable")
  //iterate through table from bottom to top to see if there's a commit enabled
  //TODO check if we need to skip the header row
  for (let i = dataTable.rows.length - 1; i >= 1; i--) {
    //iterate through rows
    let row = dataTable.rows[i]
    // console.log(row);
    // console.log(row.cells);
    // console.log(row.cells[0]);
    // console.log(row.cells[0].innerHTML);
    let virtualId = parseInt(row.cells[0].innerHTML)
    console.log("table row " + i + " has virtualId of " + virtualId)
    // document.getElementById(virtualId.toString()+"-commit")
    setTimeout(pressCommitButton, i * 100, virtualId)
    //rows would be accessed using the "row" variable assigned in the for loop
  }
}
