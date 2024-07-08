import type { CharaDevice } from "$lib/serial/device";
import type { KeyInfo } from "$lib/serial/keymap-codes";

export const charaMethods = [
  "reboot",
  "bootloader",
  "getRamBytesAvailable",
  "getSetting",
  "setSetting",
  "getLayoutKey",
  "setLayoutKey",
  "deleteChord",
  "setChord",
  "getChordPhrase",
  "getChordCount",
  "getChord",
  "send",
] as const satisfies Array<keyof CharaDevice>;

export interface ChannelResponseEventData {
  response: unknown;
}

export interface ChannelCharaEventData {
  charaChannels: string[];
  script: string;
  actionCodes: Map<number, KeyInfo>;
}

export type ChannelEventData = ChannelResponseEventData | ChannelCharaEventData;
