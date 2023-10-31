import type {CharaLayout} from "$lib/serialization/layout"
import type {Change} from "$lib/serial/connection"
import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
import type {KeyInfo} from "$lib/serial/keymap-codes"

export function getActions(
  layer: number,
  id: number,
  layout: CharaLayout,
  changes: Change[],
): [KeyInfo, boolean] {
  const actionId = layout?.[layer][id]
  const changedId = changes.findLast(it => it?.layout?.[layer]?.[id] !== undefined)?.layout?.[layer]?.[id]
  if (changedId !== undefined) {
    return [KEYMAP_CODES[changedId] ?? {code: changedId}, true]
  } else {
    return [KEYMAP_CODES[actionId] ?? {code: actionId}, false]
  }
}
