import { KEYMAP_CODES, KEYMAP_IDS } from "$lib/serial/keymap-codes";
import { derived } from "svelte/store";
import { reactiveStateField } from "./store-state-field";

const actionMeta = derived([KEYMAP_IDS, KEYMAP_CODES], ([ids, codes]) => ({
  ids,
  codes,
}));

export const actionMetaPlugin = reactiveStateField(actionMeta);
