import {KEYMAP_IDS} from "$lib/serial/keymap-codes"
import type {CharaChordFile} from "$lib/share/chara-file"

export function csvChordsToJson(csv: string): CharaChordFile {
  return {
    charaVersion: 1,
    type: "chords",
    chords: csv
      .trim()
      .split("\n")
      .map(line => {
        const [input, output] = line.split(",", 2)
        return [
          input.split("+").map(it => KEYMAP_IDS.get(it.trim())?.code ?? 0),
          output.split("").map(it => KEYMAP_IDS.get(it.trim())?.code ?? 0),
        ]
      }),
  }
}

export function isCsvChords(csv: string): boolean {
  return /^([^+, ]+( *\+ *[^+, ]+)* *, *[^+, ]+ *(\n|(?=$)))+$/.test(csv)
}
