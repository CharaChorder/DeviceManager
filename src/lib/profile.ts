import type {CharaLayout} from "$lib/serial/connection"
import type {Chord} from "$lib/serial/chord"

export interface Profile {
  name: string
  layout: CharaLayout
  chords: Chord[]
}
