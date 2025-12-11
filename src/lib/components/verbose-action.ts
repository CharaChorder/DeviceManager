import type { KeyInfo } from "$lib/serial/keymap-codes";

export function isVerbose(info: KeyInfo) {
  return (
    info.id?.length !== 1 &&
    info.title &&
    (!info.id || /F\d{1,2}/.test(info.id) === false)
  );
}
