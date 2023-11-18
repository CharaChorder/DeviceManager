import { compressActions, decompressActions } from "./actions.js";
import { fromBase64, toBase64 } from "./base64.js";

export interface NewCharaLayout {
  charaLayoutVersion: 1;
  device: "one" | "lite" | string;
  /**
   * Layers A1-A3, with numeric action codes on each
   */
  layers: [number[], number[], number[]];
}

export type CharaLayout = [number[], number[], number[]];

/**
 * Serialize a layout into a micro package
 */
export async function serializeLayout(layout: CharaLayout): Promise<Blob> {
  const items = compressActions(layout.flat());
  const stream = new Blob([items])
    .stream()
    .pipeThrough(new CompressionStream("deflate"));
  return new Response(stream).blob();
}

export async function deserializeLayout(layout: Blob): Promise<CharaLayout> {
  const stream = layout
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));
  const raw = await new Response(stream).arrayBuffer();
  const actions = decompressActions(new Uint8Array(raw));
  return [
    actions.slice(0, 90),
    actions.slice(90, 180),
    actions.slice(180, 270),
  ];
}

export async function layoutAsUrlComponent(
  layout: CharaLayout,
): Promise<string> {
  return serializeLayout(layout).then(toBase64);
}

export async function layoutFromUrlComponent(
  base64: string,
): Promise<CharaLayout> {
  return fromBase64(base64).then(deserializeLayout);
}
