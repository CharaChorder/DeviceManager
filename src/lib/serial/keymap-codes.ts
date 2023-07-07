import keymapCodes from "$lib/assets/keymap_codes.json"
import keySymbols from "$lib/assets/key-symbols.json"

export interface KeyInfo {
  /**
   * Numeric action code
   *
   * @example 345
   */
  code: number
  /**
   * Long description of the action
   *
   * @example The space bar inserts a "Space" character, commonly used as a separator between words
   */
  description?: string
  /**
   * Unique ID of the character
   *
   * @example SPACE
   */
  id?: string
  /**
   * Short text representation of the action
   *
   * @example: Space Bar
   */
  title?: string
  /**
   * Symbolic representation of the character (an icon)
   *
   * @example ␣
   */
  symbol?: string
  /**
   * The charset or category the action belongs to
   *
   * @example ASCII
   */
  charset?: CharsetCategory
}

export type CharsetCategory =
  | "None"
  | "ASCII"
  | "CP-1252"
  | "Raw Scancode"
  | "Keybard"
  | "CharaChorder"
  | "CharaChorder One"

export const KEYMAP_CODES: Record<number, KeyInfo> = Object.fromEntries(
  keymapCodes.map(([code, charset, id, title, description]) => [
    code,
    {
      code: Number(code),
      title: title || undefined,
      charset: (charset || undefined) as CharsetCategory,
      id: id || undefined,
      symbol: id ? keySymbols[id as keyof typeof keySymbols] || undefined : undefined,
      description: description || undefined,
    },
  ]),
)
