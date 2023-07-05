import {writable} from "svelte/store"
import {CharaDevice} from "$lib/serial/device.js"

/** @type {import('svelte/store').Writable<import('./device.js').CharaDevice>} */
export const serialPort = writable()

/** @type {import('svelte/store').Writable<Array<{type: 'input' | 'output' | 'system'; value: string}>>} */
export const serialLog = writable([])

/** @type {import('svelte/store').Writable<Array<{actions: number[]; phrase: string}>>} */
export const chords = writable([])

/** @type {import('svelte/store').Writable<boolean>} */
export const syncing = writable(false)

/** @type {CharaDevice} */
let device // @hmr:keep

export async function initSerial() {
  syncing.set(true)
  device ??= new CharaDevice()
  serialPort.set(device)

  const chordCount = await device.getChordCount()
  const chordInfo = []
  for (let i = 0; i < chordCount; i++) {
    chordInfo.push(await device.getChord(i))
  }
  chordInfo.sort(({phrase: a}, {phrase: b}) => a.localeCompare(b))
  chords.set(chordInfo)
  syncing.set(false)
}
