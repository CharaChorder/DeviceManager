import {get, writable} from "svelte/store"
import {CharaDevice} from "$lib/serial/device"
import type {Chord} from "$lib/serial/chord"
import type {Writable} from "svelte/store"
import type {CharaLayout} from "$lib/serialization/layout"
import {persistentWritable} from "$lib/storage"
import {userPreferences} from "$lib/preferences"

export const serialPort = writable<CharaDevice>()

export interface SerialLogEntry {
  type: "input" | "output" | "system"
  value: string
}

export const serialLog = writable<SerialLogEntry[]>([])

export const chords = persistentWritable<Chord[]>("chord-library", [], () => get(userPreferences).backup)

export const layout = persistentWritable<CharaLayout>(
  "layout",
  [[], [], []],
  () => get(userPreferences).backup,
)

export const settings = writable({})

export const unsavedChanges = writable(0)

export const highlightActions: Writable<number[]> = writable([])

export const syncStatus: Writable<"done" | "error" | "downloading" | "uploading"> = writable("done")

export async function initSerial(manual = false) {
  const device = get(serialPort) ?? new CharaDevice()
  await device.init(manual)
  serialPort.set(device)

  syncStatus.set("downloading")
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
  syncStatus.set("done")
}
