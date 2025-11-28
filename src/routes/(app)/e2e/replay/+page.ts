import type { PageLoad } from "./$types";
import { browser } from "$app/environment";
import { fromBase64 } from "$lib/serialization/base64";

export interface ReplaySerialIn {
  in: string;
}

export interface ReplaySerialOut {
  out: string;
}

export interface ReplaySerialReport {
  modifiers: number;
  keys: number[];
}

export interface ReplaySerialPress {
  press: number;
}

export interface ReplaySerialRelease {
  release: number;
}

export interface ReplayTick {
  tick: number;
}

export type ReplayDataItem =
  | ReplayTick
  | ReplaySerialIn
  | ReplaySerialOut
  | ReplaySerialReport
  | ReplaySerialPress
  | ReplaySerialRelease;

export const load = (async ({ url, fetch }) => {
  const replay = browser && new URLSearchParams(url.search).get("data");
  if (!replay) {
    return undefined;
  }
  const stream = (await fromBase64(replay, fetch))
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));
  return {
    data: JSON.parse(await new Response(stream).text()) as ReplayDataItem[],
  };
}) satisfies PageLoad;
