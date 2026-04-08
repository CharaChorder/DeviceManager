import { compressActions, decompressActions } from "../serialization/actions";
import type { KeyInfo } from "./keymap-codes";

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

const compoundHashItems = 3;
const maxChordInputItems = 12;
const actionBits = 10;
const actionMask = (1 << actionBits) - 1;

/**
 * Applies the compound value to a **valid** chord input
 */
export function applyCompound(actions: number[], compound: number): number[] {
  const result = [...actions];
  for (let i = 0; i < compoundHashItems; i++) {
    result[i] = (compound >>> (i * actionBits)) & actionMask;
  }
  result[compoundHashItems] = 0;
  return result;
}

/**
 * Extracts the compound value from a chord input, if present
 */
export function splitCompound(
  actions: number[],
): [inputs: number[], compound: number | undefined] {
  if (actions[compoundHashItems] != 0) {
    return [
      actions.slice(
        Math.max(
          0,
          actions.findIndex((it) => it !== 0),
        ),
      ),
      undefined,
    ];
  }

  let compound = 0;
  for (let i = 0; i < compoundHashItems; i++) {
    compound |= (actions[i] ?? 0) << (i * actionBits);
  }

  return [
    actions.slice(
      actions.findIndex((it, i) => i > compoundHashItems && it !== 0),
    ),
    compound === 0 ? undefined : compound,
  ];
}

export function willBeValidChordInput(
  inputCount: number,
  hasCompound: boolean,
): boolean {
  return (
    inputCount > 0 &&
    inputCount <= maxChordInputItems - (hasCompound ? compoundHashItems + 1 : 0)
  );
}

const ACTION_JOIN = 574;
const ACTION_KSC_00 = 256;

export function hasConcatenator(
  actions: number[],
  ids: Map<number, KeyInfo>,
): boolean {
  const lastAction = actions.at(-1);
  for (const action of actions) {
    if (!ids.get(action)?.printable) {
      if (actions.length == 0) {
        return false;
      }
      return lastAction == ACTION_JOIN;
    }
  }
  return lastAction != ACTION_KSC_00;
}

/**
 * Composes a chord input from a list of actions and an optional compound value
 * to a valid chord input
 */
export function composeChordInput(
  actions: number[],
  compound?: number,
): number[] {
  const result = [
    ...Array.from(
      {
        length: Math.max(0, maxChordInputItems - actions.length),
      },
      () => 0,
    ),
    ...actions.slice(0, maxChordInputItems).sort((a, b) => a - b),
  ];
  return compound !== undefined ? applyCompound(result, compound) : result;
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
  if ((hash & 0xff) === 0xff) {
    hash ^= 0xff;
  }
  hash &= 0x3fff_ffff;
  return hash === 0 ? 1 : hash;
}
