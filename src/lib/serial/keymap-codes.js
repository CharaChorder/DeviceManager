import keymapCodes from "$lib/assets/keymap_codes.json"
import keySymbols from "$lib/assets/key-symbols.json"

/** @type {Record<number, import('./keymap.js').KeyInfo>} */
export const KEYMAP_CODES = Object.fromEntries(
  keymapCodes.map(([code, charset, id, title, description]) => [
    code,
    {
      code: Number(code),
      title: title || undefined,
      charset: charset || undefined,
      id: id || undefined,
      symbol: id ? keySymbols[id] || undefined : undefined,
      description: description || undefined,
    },
  ]),
)
