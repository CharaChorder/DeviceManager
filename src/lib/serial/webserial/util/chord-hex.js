import {_actionMap} from "$lib/serial/webserial/constants/action-map.js"
import {_keyMap} from "$lib/serial/webserial/constants/key-map.js"
import {_keyMapDefaults} from "$lib/serial/webserial/constants/key-map-defaults.js"

/**
 * @param hexString {string}
 * @param chordMapId {keyof typeof import('$lib/serial/webserial/constants/key-map-defaults.js')._keyMapDefaults}
 * @returns {string}
 */
export function convertHexadecimalChordToHumanString(hexString, chordMapId) {
  let humanString = ""
  console.log(hexString)
  if (hexString.length <= 0) {
    hexString = "00"
  }
  let bigNum = BigInt("0x" + hexString)

  if (chordMapId === "CHARACHORDER") {
    // CharaChorder original uses different key map structure
    let decString = String(bigNum).split("") //no left zeros; that's ok
    console.log(decString)
    for (let i = 0; i < decString.length; i++) {
      if (decString[i] !== "0") {
        if (humanString.length > 0) {
          humanString += " + "
        }
        console.log({
          "i": i,
          "decString[i]": decString[i],
          "decString.length": decString.length,
          "decString": decString,
          "10exp": decString.length - i - 1,
          "decChordComp": decString[i] * 10 ** (decString.length - i - 1),
          // 'decChordCompBigInt':BigInt(decString[i])*BigInt((BigInt(10)**(decString.length-i-1))),
          "noteId": chord_to_noteId(decString[i] * 10 ** (decString.length - i - 1)),
        })
        let noteId
        let actionId
        if (decString[i] % 2 === 1) {
          //if it is odd, then it is simple
          noteId = chord_to_noteId(decString[i] * 10 ** (decString.length - i - 1))
          actionId = _keyMapDefaults["CHARACHORDER"][noteId]
          if (actionId === 0) {
            actionId = 0x0200 + noteId
          }
          humanString += _actionMap[actionId]
        } else {
          //value is even, odd plus a 1
          noteId = chord_to_noteId((decString[i] - 1) * 10 ** (decString.length - i - 1))
          actionId = _keyMapDefaults["CHARACHORDER"][noteId]
          if (actionId === 0) {
            actionId = 0x0200 + noteId
          }
          humanString += _actionMap[actionId]

          humanString += " + "

          noteId = chord_to_noteId(10 ** (decString.length - i - 1))
          actionId = _keyMapDefaults["CHARACHORDER"][noteId]
          if (actionId === 0) {
            actionId = 0x0200 + noteId
          }
          humanString += _actionMap[actionId]
        }
      }
    }
  } else {
    let binString = bigNum.toString(2) //no left zeros; that's ok
    console.log(binString)
    for (let i = 0; i < binString.length; i++) {
      if (binString[i] === "1") {
        if (humanString.length > 0) {
          humanString += " + "
        }
        humanString += _keyMap[64 - binString.length + i]
        //console.log(i);
        //humanString+=_keyMap[(64-binString.length+i)];
      }
    }
  }

  console.log(humanString)
  return humanString
}

/**
 * @param humanString {string}
 * @returns {string}
 */
export function convertHumanStringToHexadecimalPhrase(humanString) {
  let hexString = ""
  for (let i = 0; i < humanString.length; i++) {
    let hex = Number(humanString.charCodeAt(i)).toString(16)
    hexString += hex
  }
  hexString = hexString.toUpperCase()
  console.log(hexString)
  return hexString
}

/**
 * @param hexString {string}
 * @returns {string}
 */
function convertHexadecimalPhraseToAsciiString(hexString) {
  let asciiString = ""
  console.log("convertHexadecimalPhraseToAsciiString()")

  //assume 2x size
  //get every 2 characters
  //TODO covert to byte array and account for non-ascii inputs like mouse moves
  for (let i = 0; i < hexString.length; i += 2) {
    asciiString += String.fromCharCode(parseInt(hexString.substr(i, 2), 16))
    //console.log("0x"+hexString.substr(i, 2));
    //asciiString += String.fromCharCode("0x"+hexString.substr(i, 2));
  }
  console.log(asciiString)
  return asciiString
}

function noteId_to_chord(note) {
  return BigInt(2 * ((note - 1) % 5) + 1) * BigInt(10) ** BigInt(Math.floor((note - 1) / 5))
}

function chord_to_noteId(chord) {
  const part1 = 5 * Math.floor(Math.log10(chord))
  const part2 = Math.floor(chord / 10 ** Math.floor(Math.log10(chord)) + 1) / 2
  const part3 = Math.log10(chord)

  const full = Math.floor(
    5 * Math.floor(Math.log10(chord)) + Math.floor(chord / 10 ** Math.floor(Math.log10(chord)) + 1) / 2,
  )
  console.log([chord, part1, part2, part3, full])
  return full
}

/**
 * @param humanString {string}
 * @param chordMapId {keyof typeof import('$lib/serial/webserial/constants/key-map-defaults.js')._keyMapDefaults}
 * @returns {Promise<bigint>}
 */
export async function convertHumanStringToBigNum(humanString, chordMapId) {
  console.log("convertHumanStringToBigNum")
  let bigNum = BigInt(0)
  //parse the pieces with _+_
  let humanStringParts = humanString.split(" + ") //assumes plus isn't being used; bc default is = for the +/= key
  console.log(humanStringParts)
  for (const part of humanStringParts) {
    let actionId = _actionMap.indexOf(part)
    console.log(actionId)
    if (chordMapId === "CHARACHORDER") {
      //charachorder original uses different key map structure
      let keyId
      if (actionId < 0x0200) {
        keyId = _keyMapDefaults["CHARACHORDER"].indexOf(actionId)
      } else {
        keyId = actionId - 0x0200 //using the physical key position
      }

      console.log(keyId)
      bigNum = BigInt(noteId_to_chord(keyId))
      // bigNum+= BigInt(noteId_to_chord(keyId));
      console.log(bigNum)
    } else {
      //use other keymap
    }
  }
  console.log(bigNum)
  return bigNum
}

/**
 * @param humanString {string}
 * @param chordMapId {keyof typeof import('$lib/serial/webserial/constants/key-map-defaults.js')._keyMapDefaults}
 * @returns {string}
 */
export function convertHumanStringToHexadecimalChord(humanString, chordMapId) {
  let bigNum = BigInt(0)
  //parse the pieces with _+_
  let humanStringParts = humanString.split(" + ") //assumes plus isn't being used; bc default is = for the +/= key
  console.log(humanStringParts)
  humanStringParts.forEach(async part => {
    let actionId = _actionMap.indexOf(part)
    console.log(actionId)
    if (chordMapId === "CHARACHORDER") {
      //charachorder original uses different key map structure
      let keyId
      if (actionId < 0x0200) {
        keyId = _keyMapDefaults["CHARACHORDER"].indexOf(actionId)
      } else {
        keyId = actionId - 0x0200 //using the physical key position
      }

      console.log(keyId)
      bigNum += BigInt(noteId_to_chord(keyId))
      console.log(bigNum)
    } else {
      //use other keymap
    }
  })
  console.log(bigNum)

  let hexString = bigNum.toString(16).toUpperCase()
  hexString = "0".repeat(16 - hexString.length) + hexString //add leading zeros up to 16 characters
  console.log(hexString)

  return hexString
}
