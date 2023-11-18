/**
 * Compresses an action list into a Uint8Array of variable-length 8/13-bit integers.
 *
 * Action codes <32 are invalid.
 *
 * @param actions {number[]}
 * @returns {Uint8Array}
 */
export function compressActions(actions) {
  const buffer = new Uint8Array(actions.length * 2);
  let i = 0;
  for (const action of actions) {
    if (action > 0xff) {
      buffer[i++] = action >>> 8;
    }
    buffer[i++] = action & 0xff;
  }
  return buffer.slice(0, i);
}

/**
 * Decompresses actions
 *
 * @see {compressActions}
 * @param raw {Uint8Array}
 * @returns {number[]}
 */
export function decompressActions(raw) {
  const actions = /** @type {number[]} */ [];
  for (let i = 0; i < raw.length; i++) {
    let action = raw[i];
    if (action > 0 && action < 32) {
      action = (action << 8) | raw[++i];
    }
    actions.push(action);
  }
  return actions;
}
