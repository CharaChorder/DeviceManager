import {chords, layout} from "$lib/serial/connection"
import {userPreferences} from "$lib/preferences"

const PROFILE_KEY = "profiles"
const CHORD_LIBRARY_STORAGE_KEY = "chord-library"
const LAYOUT_STORAGE_KEY = "layouts"
const PREFERENCES = "user-preferences"

export function initLocalStorage() {
  const storedPreferences = localStorage.getItem(PREFERENCES)
  if (storedPreferences) {
    userPreferences.set(JSON.parse(storedPreferences))
  }
  userPreferences.subscribe(preferences => {
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences))
  })

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
