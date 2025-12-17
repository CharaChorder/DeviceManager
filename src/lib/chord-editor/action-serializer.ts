import { KEYMAP_CODES, type KeyInfo } from "$lib/serial/keymap-codes";
import { get } from "svelte/store";

export function canUseIdAsString(info: KeyInfo): boolean {
  return !!info.id && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(info.id);
}

export function actionToValue(action: number | KeyInfo) {
  const info =
    typeof action === "number" ? get(KEYMAP_CODES).get(action) : action;
  if (info && info.id?.length === 1)
    return /^[<>\\\s]$/.test(info.id) ? `\\${info.id}` : info.id;
  if (!info || !canUseIdAsString(info))
    return `<0x${(info?.code ?? action).toString(16).padStart(2, "0")}>`;
  return `<${info.id}>`;
}
