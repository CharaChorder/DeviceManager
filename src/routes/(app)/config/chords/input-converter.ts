import { KEYMAP_IDS, KEYMAP_KEYCODES } from "$lib/serial/keymap-codes";
import { get } from "svelte/store";

export function inputToAction(
  event: KeyboardEvent,
  useKeycodes?: boolean,
): number | undefined {
  if (useKeycodes) {
    return get(KEYMAP_KEYCODES).get(event.code);
  } else {
    return (
      get(KEYMAP_IDS).get(event.key)?.code ??
      get(KEYMAP_KEYCODES).get(event.code)
    );
  }
}
