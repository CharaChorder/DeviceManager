import {writable} from "svelte/store"
import {CharaDevice} from "$lib/serial/device"

export const serialPort = writable<CharaDevice>()

export interface SerialLogEntry {
  type: "input" | "output" | "system"
  value: string
}

export const serialLog = writable<SerialLogEntry[]>([])

export interface Chord {
  actions: number[]
  phrase: string
}

export const chords = writable<Chord[]>([])

export type CharaLayout = [number[], number[], number[]]

export const layout = writable<CharaLayout>([[], [], []])

export const syncing = writable(false)

/** @type {CharaDevice} */
let device // @hmr:keep

export async function initSerial() {
  syncing.set(true)
  device ??= new CharaDevice()
  serialPort.set(device)

  const parsedLayout: CharaLayout = [[], [], []]
  for (let layer = 1; layer <= 3; layer++) {
    for (let i = 0; i < 90; i++) {
      parsedLayout[layer - 1][i] = await device.getLayoutKey(layer, i)
    }
  }
  layout.set(parsedLayout)

  const chordCount = await device.getChordCount()
  const chordInfo = []
  for (let i = 0; i < chordCount; i++) {
    chordInfo.push(await device.getChord(i))
  }
  chordInfo.sort(({phrase: a}, {phrase: b}) => a.localeCompare(b))
  chords.set(chordInfo)
  syncing.set(false)
}
