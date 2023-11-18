import {
  compressActions,
  decompressActions,
} from "../../../serial-api/lib/serialization/actions";
import { CHARA_FILE_TYPES } from "./share-url";

export type ActionArray = number[] | ActionArray[];
export function serializeActionArray(array: ActionArray): Uint8Array {
  let out = new Uint8Array(5);
  const writer = new DataView(out.buffer);
  writer.setUint32(0, array.length);

  if (array.length === 0) {
    return out;
  } else if (typeof array[0] === "number") {
    writer.setUint8(4, CHARA_FILE_TYPES.indexOf("number"));
    const compressed = compressActions(array as number[]);
    writer.setUint32(0, compressed.length);
    return concatUint8Arrays(out, compressed);
  } else if (Array.isArray(array[0])) {
    writer.setUint8(4, CHARA_FILE_TYPES.indexOf("array"));
    return concatUint8Arrays(
      out,
      ...(array as ActionArray[]).map(serializeActionArray),
    );
  } else {
    throw new Error("Not implemented");
  }
}

export function deserializeActionArray(
  raw: Uint8Array,
  cursor = { pos: 0 },
): ActionArray {
  const reader = new DataView(raw.buffer);
  const length = reader.getUint32(cursor.pos);
  cursor.pos += 4;
  const type = CHARA_FILE_TYPES[reader.getUint8(cursor.pos)];
  cursor.pos++;

  console.log(cursor, raw);

  if (type === "number") {
    const decompressed = decompressActions(
      raw.slice(cursor.pos, cursor.pos + length),
    );
    cursor.pos += length;
    return decompressed;
  } else if (type === "array") {
    const out = [];
    for (let i = 0; i < length; i++) {
      out.push(deserializeActionArray(raw, cursor));
    }
    return out;
  } else {
    throw new Error("Not implemented");
  }
}

export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(arrays.reduce((a, b) => a + b.length, 0));
  let offset = 0;
  for (const array of arrays) {
    out.set(array, offset);
    offset += array.length;
  }
  return out;
}
