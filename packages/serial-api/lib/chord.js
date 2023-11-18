import { compressActions, decompressActions } from "./serialization/actions";

/**
 * @param phrase {string}
 * @returns {number[]}
 */
export function parseChordOutput(phrase) {
  return decompressActions(
    Uint8Array.from({ length: phrase.length / 2 }).map((_, i) =>
      Number.parseInt(phrase.slice(i * 2, i * 2 + 2), 16),
    ),
  );
}

/**
 * @param phrase {number[]}
 * @returns {string}
 */
export function stringifyChordOutput(phrase) {
  return [...compressActions(phrase)]
    .map((it) => it.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * @param actions {string}
 * @returns {number[]}
 */
export function parseChordInput(actions) {
  return deserializeChordInput(BigInt(`0x${actions}`));
}

/**
 * @param actions {number[]}
 * @returns {string}
 */
export function stringifyChordInput(actions) {
  return serializeChordInput(actions)
    .toString(16)
    .padStart(32, "0")
    .toUpperCase();
}

/**
 * Binary serialization of actions
 *
 * Actions are represented as 10-bit codes, for a maximum of 12 actions
 * @param actions {number[]}
 * @returns {bigint}
 */
export function serializeChordInput(actions) {
  let native = 0n;
  for (let i = 1; i <= actions.length; i++) {
    native |=
      BigInt(actions[actions.length - i] & 0x3ff) << BigInt((12 - i) * 10);
  }
  return native;
}

/**
 * @see {serializeChordInput}
 * @param native {bigint}
 * @returns {number[]}
 */
export function deserializeChordInput(native) {
  const actions = [];
  for (let i = 0; i < 12; i++) {
    const action = Number(native & 0x3ffn);
    if (action !== 0) {
      actions.push(action);
    }
    native >>= 10n;
  }

  return actions;
}
