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
  return `${serializeActions(chord.actions).toString(16).padStart(32, "0")} ${chord.phrase
    .map(it => it.toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase()
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
  for (let i = 1; i <= actions.length; i++) {
    native |= BigInt(actions[actions.length - i] & 0x3ff) << BigInt((12 - i) * 10)
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
