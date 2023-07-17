import type {Chord} from "$lib/serial/chord"
import type {CharaLayout} from "$lib/serialization/layout"

export interface Profile {
  name: string
  layout: CharaLayout
  chords: Chord[]
}
