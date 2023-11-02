import {get, writable} from "svelte/store"
import {CharaDevice} from "$lib/serial/device"
import type {Chord} from "$lib/serial/chord"
import type {Writable} from "svelte/store"
import type {CharaLayout} from "$lib/serialization/layout"
import {persistentWritable} from "$lib/storage"
import {userPreferences} from "$lib/preferences"
import settingInfo from "$lib/assets/settings.yml"

export const serialPort = writable<CharaDevice | undefined>()

export interface SerialLogEntry {
  type: "input" | "output" | "system"
  value: string
}

export const serialLog = writable<SerialLogEntry[]>([])

/**
 * Chords as read from the device
 */
export const deviceChords = persistentWritable<Chord[]>(
  "chord-library",
  [],
  () => get(userPreferences).backup,
)

/**
 * Layout as read from the device
 */
export const deviceLayout = persistentWritable<CharaLayout>(
  "layout",
  [[], [], []],
  () => get(userPreferences).backup,
)

/**
 * Settings as read from the device
 */
export const deviceSettings = persistentWritable<number[]>(
  "device-settings",
  [],
  () => get(userPreferences).backup,
)

export const syncStatus: Writable<"done" | "error" | "downloading" | "uploading"> = writable("done")

export async function initSerial(manual = false) {
  const device = get(serialPort) ?? new CharaDevice()
  await device.init(manual)
  serialPort.set(device)

  syncStatus.set("downloading")
  const parsedSettings: number[] = []
  for (const key in settingInfo.settings) {
    try {
      parsedSettings[Number.parseInt(key)] = await device.getSetting(Number.parseInt(key))
    } catch {}
  }
  deviceSettings.set(parsedSettings)

  const parsedLayout: CharaLayout = [[], [], []]
  for (let layer = 1; layer <= 3; layer++) {
    for (let i = 0; i < device.keyCount; i++) {
      parsedLayout[layer - 1][i] = await device.getLayoutKey(layer, i)
    }
  }
  deviceLayout.set(parsedLayout)

  const chordCount = await device.getChordCount()
  const chordInfo = []
  for (let i = 0; i < chordCount; i++) {
    chordInfo.push(await device.getChord(i))
  }
  deviceChords.set(chordInfo)
  syncStatus.set("done")
}
