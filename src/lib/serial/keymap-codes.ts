import type {ActionInfo, KeymapCategory} from "$lib/assets/keymaps/keymap"

export interface KeyInfo extends Partial<ActionInfo> {
  code: number
  category: KeymapCategory
}

const keymaps = (await Promise.all(
  Object.values(import.meta.glob("$lib/assets/keymaps/*.yml")).map(async load =>
    load().then(it => (it as any).default),
  ),
)) as KeymapCategory[]

export const KEYMAP_CODES: Record<number, KeyInfo> = Object.fromEntries(
  keymaps.flatMap(category =>
    Object.entries(category.actions).map(([code, action]) => [
      Number(code),
      {...action, code: Number(code), category},
    ]),
  ),
)
