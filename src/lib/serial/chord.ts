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

/**
 * Hashes a chord input the same way as CCOS
 */
export function hashChord(actions: number[]) {
  const chord = new Uint8Array(16);
  const view = new DataView(chord.buffer);
  const serialized = serializeActions(actions);
  view.setBigUint64(0, serialized & 0xffff_ffff_ffff_ffffn, true);
  view.setBigUint64(8, serialized >> 64n, true);
  let hash = 2166136261;
  for (let i = 0; i < 16; i++) {
    hash = Math.imul(hash ^ view.getUint8(i), 16777619);
  }
  return hash & 0x3fff_ffff;
}
