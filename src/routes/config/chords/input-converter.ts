import { KEYMAP_IDS, KEYMAP_KEYCODES } from "$lib/serial/keymap-codes";

export function inputToAction(
  event: KeyboardEvent,
  useKeycodes?: boolean,
): number | undefined {
  if (useKeycodes) {
    return KEYMAP_KEYCODES.get(event.code);
  } else {
    return KEYMAP_IDS.get(event.key)?.code ?? KEYMAP_KEYCODES.get(event.code);
  }
}
