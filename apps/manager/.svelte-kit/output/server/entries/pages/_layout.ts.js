import { b as browser } from "../../chunks/environment2.js";
function decompressActions(raw) {
  const actions = [];
  for (let i = 0; i < raw.length; i++) {
    let action = raw[i];
    if (action > 0 && action < 32) {
      action = action << 8 | raw[++i];
    }
    actions.push(action);
  }
  return actions;
}
function deserializeActionArray(raw, cursor = { pos: 0 }) {
  const reader = new DataView(raw.buffer);
  const length = reader.getUint32(cursor.pos);
  cursor.pos += 4;
  const type = CHARA_FILE_TYPES[reader.getUint8(cursor.pos)];
  cursor.pos++;
  console.log(cursor, raw);
  if (type === "number") {
    const decompressed = decompressActions(raw.slice(cursor.pos, cursor.pos + length));
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
async function fromBase64(base64, fetch = window.fetch) {
  return fetch(
    `data:application/octet-stream;base64,${base64.replaceAll(".", "+").replaceAll("_", "/").replaceAll("-", "=")}`
  ).then((it) => it.blob());
}
const keys = {
  layout: [
    ["layout", "array"],
    ["device", "string"]
  ],
  chords: [["chords", "array"]],
  settings: [["settings", "array"]]
};
const CHARA_FILE_TYPES = ["unknown", "number", "string", "array"];
const sep = "\n";
async function charaFileFromUriComponent(uriComponent, fetch = window.fetch) {
  const [fileType, version, ...values] = uriComponent.split(sep);
  const file = { type: fileType, charaVersion: Number(version) };
  for (const [key, type] of keys[fileType]) {
    const value = values.shift();
    if (type === "string") {
      file[key] = value;
    } else if (type === "array") {
      const stream = (await fromBase64(value, fetch)).stream().pipeThrough(new DecompressionStream("deflate"));
      const actions = new Uint8Array(await new Response(stream).arrayBuffer());
      console.log(actions);
      file[key] = deserializeActionArray(actions);
    }
  }
  return file;
}
const prerender = true;
const trailingSlash = "always";
const load = async ({ url, data, fetch }) => {
  const importFile = browser;
  return {
    ...data,
    importFile: importFile ? await charaFileFromUriComponent(importFile, fetch) : void 0
  };
};
export {
  load,
  prerender,
  trailingSlash
};
