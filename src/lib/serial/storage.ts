import {chords, layout} from "$lib/serial/connection"

const PROFILE_KEY = "profiles"
const CHORD_LIBRARY_STORAGE_KEY = "chord-library"
const LAYOUT_STORAGE_KEY = "layouts"

export function initLocalStorage() {
  const storedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY)
  if (storedLayout) {
    layout.set(JSON.parse(storedLayout))
  }
  const storedChords = localStorage.getItem(CHORD_LIBRARY_STORAGE_KEY)
  if (storedChords) {
    chords.set(JSON.parse(storedChords))
  }

  layout.subscribe(layout => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  })
  chords.subscribe(chords => {
    localStorage.setItem(CHORD_LIBRARY_STORAGE_KEY, JSON.stringify(chords))
  })
}
