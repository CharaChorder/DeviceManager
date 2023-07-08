import {writable} from "svelte/store"
import {CharaDevice} from "$lib/serial/device"
import type {Chord} from "$lib/serial/chord"

export const serialPort = writable<CharaDevice>()

export interface SerialLogEntry {
  type: "input" | "output" | "system"
  value: string
}

export const serialLog = writable<SerialLogEntry[]>([])

export const chords = writable<Chord[]>([])

export type CharaLayout = [number[], number[], number[]]

export const layout = writable<CharaLayout>([[], [], []])

export const syncing = writable(false)

let device: CharaDevice // @hmr:keep

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
  chords.set(chordInfo)
  syncing.set(false)
}
