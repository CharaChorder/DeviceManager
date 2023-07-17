import type {Chord} from "$lib/serial/chord"
import {KEYMAP_CODES} from "$lib/serial/keymap-codes"

interface Language {
  name: string
  noLazyMode?: boolean
  orderedByFrequency?: boolean
  words: string[]
}

export async function calculateChordCoverage(chords: Chord[]) {
  const language: Language = await fetch("/languages/english.json").then(it => it.json())

  const words = new Set(language.words)
  for (const chord of chords) {
    words.delete(chord.phrase.map(it => KEYMAP_CODES[it].id!).join(""))
  }

  return {
    coverage: words.size / language.words.length,
    missing: [...words.values()],
  }
}
