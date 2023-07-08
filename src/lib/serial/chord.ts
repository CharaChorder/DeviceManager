export interface Chord {
  actions: number[]
  phrase: number[]
}

/**
 * Turns a chord into a serial-command-compatible string
 *
 * @example "000CC200000000000000000000000000 7468726565"
 */
export function chordAsCommandCompatible(chord: Chord): string {
  return `${serializeActions(chord.actions).toString(16).padStart(32)} ${chord.phrase.map(it =>
    it.toString(16),
  )}`
}

/**
 * Turns a command response into a chord
 *
 * @see {chordAsCommandCompatible}
 */
export function chordFromCommandCompatible(command: string): Chord {
  const [actions, phrase] = command.split(" ")
  return {
    actions: deserializeActions(BigInt(`0x${actions}`)),
    phrase: Array.from({length: phrase.length / 2}).map((_, i) =>
      Number.parseInt(phrase.slice(i * 2, i * 2 + 2), 16),
    ),
  }
}

/**
 * Binary serialization of actions
 *
 * Actions are represented as 10-bit codes, for a maximum of 12 actions
 */
export function serializeActions(actions: number[]): bigint {
  let native = 0n
  for (let i = 0; i < actions.length; i++) {
    native |= BigInt(actions[i] & 0x3ff) << BigInt((11 - i) * 10)
  }
  return native
}

/**
 * @see {serializeActions}
 */
export function deserializeActions(native: bigint): number[] {
  const actions = []
  for (let i = 0; i < 12; i++) {
    const action = Number(native & 0x3ffn)
    if (action !== 0) {
      actions.push(action)
    }
    native >>= 10n
  }

  return actions
}

const CHL_VERSION = 1
const CHL_MAGIC = "CHL"

/**
 * Binary serialization of the chord library
 *
 * Layout is as follows:
 * ```rs
 * struct Chords {
 *   magic: "CHL"
 *   version: u8
 *   chordCount: u32
 *   chords: chord[]
 * }
 *
 * struct Chord {
 *   id: u32
 *   phrase: u128
 *   actionCount: u16
 *   actions: u8[]
 * }
 * ```
 * Serialized as little endian.
 *
 * @param chords
 */
export function chordsToFile(chords: Chord[]): ArrayBuffer {
  const actionsTotalCount = chords.reduce((size, chord) => size + chord.actions.length, 0)

  const buffer = new ArrayBuffer(4 + 4 + chords.length * (4 + 16 + 2) + actionsTotalCount)
  const view = new DataView(buffer)
  let byteOffset = 0

  for (const byte of CHL_MAGIC) {
    view.setUint8(byteOffset++, byte.codePointAt(0)!)
  }
  view.setUint8(byteOffset++, CHL_VERSION)
  view.setUint32(byteOffset, chords.length, true)
  byteOffset += 4
  for (const chord of chords) {
    const actions = serializeActions(chord.actions)
    view.setBigUint64(byteOffset, actions << 64n, true)
    byteOffset += 8
    view.setBigUint64(byteOffset, actions & 0xffff_ffff_ffff_ffffn, true)
    byteOffset += 8

    view.setUint16(byteOffset, chord.phrase.length, true)
    byteOffset += 2
    for (const action of chord.phrase) {
      view.setUint8(byteOffset++, action)
    }
  }

  return buffer
}

/**
 * @see {chordsToFile}
 */
export function chordsFromFile(buffer: ArrayBuffer): Chord[] {
  const view = new DataView(buffer)
  let byteOffset = 0

  let magic = ""
  for (let i = 0; i < CHL_MAGIC.length; i++) {
    magic += view.getUint8(byteOffset++)
  }
  if (magic !== CHL_MAGIC) throw new Error("Not a .chl file")
  if (view.getUint8(byteOffset++) !== CHL_VERSION) throw Error("Invalid .chl [version]")

  const chords: Chord[] = Array.from({length: view.getUint32(byteOffset, true)})
  byteOffset += 4
  for (let i = 0; i < chords.length; i++) {
    let actions = view.getBigUint64(byteOffset, true) >> 64n
    byteOffset += 8
    actions |= view.getBigUint64(byteOffset, true)
    byteOffset += 8

    const phrase: number[] = Array.from({length: view.getUint16(byteOffset, true)})
    byteOffset += 2
    for (let i = 0; i < phrase.length; i++) {
      phrase[i] = view.getUint8(byteOffset++)
    }

    chords[i] = {
      actions: deserializeActions(actions),
      phrase,
    }
  }

  return chords
}
