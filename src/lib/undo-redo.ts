import {persistentWritable} from "$lib/storage"
import {derived} from "svelte/store"
import type {Chord} from "$lib/serial/chord"
import {deviceChords, deviceLayout, deviceSettings} from "$lib/serial/connection"

export enum ChangeType {
  Layout,
  Chord,
  Setting,
}

export interface LayoutChange {
  type: ChangeType.Layout
  id: number
  layer: number
  action: number
}

export interface ChordChange {
  type: ChangeType.Chord
  id: number[]
  actions: number[]
  phrase: number[]
}

export interface SettingChange {
  type: ChangeType.Setting
  id: number
  setting: number
}

export interface ChangeInfo {
  isApplied: boolean
  isCommitted?: boolean
}

export type Change = LayoutChange | ChordChange | SettingChange

export const changes = persistentWritable<Change[]>("changes", [])

export interface Overlay {
  layout: [Map<number, number>, Map<number, number>, Map<number, number>]
  chords: Map<string, Chord>
  settings: Map<number, number>
}

export const overlay = derived(changes, changes => {
  console.time("overlay building")
  const overlay: Overlay = {
    layout: [new Map(), new Map(), new Map()],
    chords: new Map(),
    settings: new Map(),
  }

  for (const change of changes) {
    switch (change.type) {
      case ChangeType.Layout:
        overlay.layout[change.layer].set(change.id, change.action)
        break
      case ChangeType.Chord:
        overlay.chords.set(JSON.stringify(change.id), {actions: change.actions, phrase: change.phrase})
        break
      case ChangeType.Setting:
        overlay.settings.set(change.id, change.setting)
        break
    }
  }
  console.timeEnd("overlay building")

  return overlay
})

export const settings = derived([overlay, deviceSettings], ([overlay, settings]) =>
  settings.map<{value: number} & ChangeInfo>((value, id) => ({
    value: overlay.settings.get(id) ?? value,
    isApplied: !overlay.settings.has(id),
  })),
)

export type KeyInfo = {action: number} & ChangeInfo
export const layout = derived([overlay, deviceLayout], ([overlay, layout]) =>
  layout.map(
    (actions, layer) =>
      actions.map<KeyInfo>((action, id) => ({
        action: overlay.layout[layer].get(id) ?? action,
        isApplied: !overlay.layout[layer].has(id),
      })) as [KeyInfo, KeyInfo, KeyInfo],
  ),
)

export type ChordInfo = Chord &
  ChangeInfo & {phraseChanged: boolean; actionsChanged: boolean} & {id: number[]}
export const chords = derived([overlay, deviceChords], ([overlay, chords]) =>
  chords
    .map<ChordInfo>(chord => {
      const id = JSON.stringify(chord.actions)
      if (overlay.chords.has(id)) {
        const changedChord = overlay.chords.get(id)!
        return {
          id: chord.actions,
          actions: changedChord.actions,
          phrase: changedChord.phrase,
          actionsChanged: id !== JSON.stringify(changedChord.actions),
          phraseChanged: JSON.stringify(chord.phrase) !== JSON.stringify(changedChord.phrase),
          isApplied: false,
        }
      } else {
        return {
          id: chord.actions,
          actions: chord.actions,
          phrase: chord.phrase,
          phraseChanged: false,
          actionsChanged: false,
          isApplied: true,
        }
      }
    })
    .sort((a, b) => a.phrase.map((it, i) => it - b.phrase[i]).find(it => it !== 0) ?? 0),
)
