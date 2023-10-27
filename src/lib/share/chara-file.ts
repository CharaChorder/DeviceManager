export interface CharaFile<T extends string> {
  charaVersion: 1
  type: T
}

export interface CharaLayoutFile extends CharaFile<"layout"> {
  device: "one" | "lite" | string
  layout: [number[], number[], number[]]
}

export interface CharaChordFile extends CharaFile<"chords"> {
  chords: [number[], number[]][]
}

export interface CharaChordSettings extends CharaFile<"settings"> {
  settings: number[]
}

export type CharaFiles = CharaLayoutFile | CharaChordFile
