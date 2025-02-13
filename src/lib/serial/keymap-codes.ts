import type { ActionInfo, KeymapCategory } from "$lib/assets/keymaps/keymap";
import { derived, type Readable } from "svelte/store";
import { deviceMeta } from "./connection";

export interface KeyInfo extends Partial<ActionInfo> {
  code: number;
  category?: KeymapCategory;
}

const fallbackActions = await Promise.all<KeymapCategory>(
  Object.values(import.meta.glob("$lib/assets/keymaps/*.yml")).map(
    async (load) => load().then((it) => (it as any).default),
  ),
);

export let KEYMAP_CATEGORIES: Readable<KeymapCategory[]> = derived(
  deviceMeta,
  (deviceMeta) => deviceMeta?.actions ?? fallbackActions,
);

export const KEYMAP_CODES: Readable<Map<number, KeyInfo>> = derived(
  KEYMAP_CATEGORIES,
  (categories) =>
    new Map<number, KeyInfo>(
      categories.flatMap((category) =>
        Object.entries(category.actions).map(([code, action]) => [
          Number(code),
          { ...action, code: Number(code), category },
        ]),
      ),
    ),
);

export const KEYMAP_KEYCODES: Readable<Map<string, number>> = derived(
  KEYMAP_CATEGORIES,
  (categories) =>
    new Map<string, number>(
      categories
        .flatMap((category) =>
          Object.entries(category.actions).map(
            ([code, action]) => [action.keyCode!, Number(code)] as const,
          ),
        )
        .filter(([keyCode]) => keyCode !== undefined),
    ),
);

export const KEYMAP_IDS: Readable<Map<string, KeyInfo>> = derived(
  KEYMAP_CATEGORIES,
  (categories) =>
    new Map<string, KeyInfo>(
      categories
        .flatMap((category) =>
          Object.entries(category.actions).map(
            ([code, action]) =>
              [
                action.id!,
                { ...action, code: Number(code), category },
              ] as const,
          ),
        )
        .filter(([id]) => id !== undefined),
    ),
);
