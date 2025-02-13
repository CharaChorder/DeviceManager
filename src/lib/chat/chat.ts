import { writable, type Writable } from "svelte/store";
import type { MatrixClient, RoomMember } from "matrix-js-sdk";
import { persistentWritable } from "$lib/storage";
import {
  themeFromSourceColor,
  argbFromHex,
  type CustomColorGroup,
} from "@material/material-color-utilities";
import type { UserTheme } from "$lib/preferences";

export const matrixClient: Writable<MatrixClient> = writable();

export const currentRoomId = persistentWritable<string | null>(
  "currentRoomId",
  null,
);

export function memberColor(
  member: RoomMember,
  theme: UserTheme,
): CustomColorGroup {
  let hash = 0;
  member.userId.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }

  return themeFromSourceColor(argbFromHex(theme.color), [
    { value: argbFromHex(color), name: "member", blend: true },
  ]).customColors.find((c) => c.color.name === "member")!;
}
