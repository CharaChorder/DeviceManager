/**
 * Compresses an action list into a Uint8Array of 10-bit integers, supporting values of up to 1023
 */
export function compressActions(actions: number[]): Uint8Array {
  const overflow = actions.length % 4
  const array = new Uint8Array(
    Math.ceil((actions.length - overflow) * 1.25 + (overflow === 0 ? 0 : overflow + 1)),
  )
  let arrayOffset = 0
  for (let i = 0; i < actions.length; i += 4) {
    let final = 0
    for (let j = 0; j < 4 && i + j < actions.length; j++) {
      const action = actions[i + j]
      array[arrayOffset++] = (action >>> 2) & 0xff
      final |= (action & 0x03) << (j * 2)
    }
    array[arrayOffset++] = final
  }
  console.assert(arrayOffset === array.length)
  return array
}

/**
 * Decompresses actions
 *
 * @see {compressActions}
 */
export function decompressActions(raw: Uint8Array): number[] {
  const actions: number[] = []
  for (let i = 0; i < raw.length + 4; i += 5) {
    const overflow = raw[Math.min(i + 4, raw.length - 1)]

    for (let j = 0; j < 4 && i + j < raw.length - 1; j++) {
      actions.push((raw[i + j] << 2) | ((overflow >>> (j * 2)) & 0x3))
    }
  }
  return actions
}
