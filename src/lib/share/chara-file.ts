export interface CharaFile<T extends string> {
  charaVersion: 1;
  type: T;
}

export interface CharaLayoutFile extends CharaFile<"layout"> {
  device?: "ONE" | "LITE" | string;
  layout: [number[], number[], number[]];
}

export interface CharaChordFile extends CharaFile<"chords"> {
  chords: [number[], number[]][];
}

export interface CharaSettingsFile extends CharaFile<"settings"> {
  settings: number[];
}

export interface CharaBackupFile extends CharaFile<"backup"> {
  history: [CharaChordFile, CharaLayoutFile, CharaSettingsFile][];
}

export type CharaFiles = CharaLayoutFile | CharaChordFile | CharaSettingsFile;
