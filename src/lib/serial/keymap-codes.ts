import type {ActionInfo, KeymapCategory} from "$lib/assets/keymaps/keymap"

export interface KeyInfo extends Partial<ActionInfo> {
  code: number
  category: KeymapCategory
}

export const KEYMAP_CATEGORIES = (await Promise.all(
  Object.values(import.meta.glob("$lib/assets/keymaps/*.yml")).map(async load =>
    load().then(it => (it as any).default),
  ),
)) as KeymapCategory[]

export const KEYMAP_CODES: Record<number, KeyInfo> = Object.fromEntries(
  KEYMAP_CATEGORIES.flatMap(category =>
    Object.entries(category.actions).map(([code, action]) => [
      Number(code),
      {...action, code: Number(code), category},
    ]),
  ),
)

export const KEYMAP_IDS: Map<string, KeyInfo> = new Map(
  KEYMAP_CATEGORIES.flatMap(category =>
    Object.entries(category.actions).map(
      ([code, action]) => [action.id!, {...action, code: Number(code), category}] as const,
    ),
  ).filter(([id]) => id !== undefined),
)

export const specialKeycodes = new Map([
  [" ", 32], // Space
])
