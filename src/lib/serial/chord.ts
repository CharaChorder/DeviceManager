import { compressActions, decompressActions } from "../serialization/actions";

export interface Chord {
  actions: number[];
  phrase: number[];
}

export function parsePhrase(phrase: string): number[] {
  return decompressActions(
    Uint8Array.from({ length: phrase.length / 2 }).map((_, i) =>
      Number.parseInt(phrase.slice(i * 2, i * 2 + 2), 16),
    ),
  );
}

export function stringifyPhrase(phrase: number[]): string {
  return [...compressActions(phrase)]
    .map((it) => it.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function parseChordActions(actions: string): number[] {
  return deserializeActions(BigInt(`0x${actions}`));
}

export function stringifyChordActions(actions: number[]): string {
  return serializeActions(actions).toString(16).padStart(32, "0").toUpperCase();
}

/**
 * Binary serialization of actions
 *
 * Actions are represented as 10-bit codes, for a maximum of 12 actions
 */
export function serializeActions(actions: number[]): bigint {
  let native = 0n;
  for (let i = 1; i <= actions.length; i++) {
    native |=
      BigInt(actions[actions.length - i]! & 0x3ff) << BigInt((12 - i) * 10);
  }
  return native;
}

/**
 * @see {serializeActions}
 */
export function deserializeActions(native: bigint): number[] {
  const actions = [];
  for (let i = 0; i < 12; i++) {
    const action = Number(native & 0x3ffn);
    actions.push(action);
    native >>= 10n;
  }

  return actions;
}
