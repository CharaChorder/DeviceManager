import type {CharaFile, CharaFiles} from "$lib/share/chara-file"
import type {ActionArray} from "$lib/share/action-array"
import {deserializeActionArray, serializeActionArray} from "$lib/share/action-array"
import {fromBase64, toBase64} from "$lib/serialization/base64"

type CharaLayoutOrder = {
  [K in CharaFiles["type"]]: Array<
    [Exclude<keyof Extract<CharaFiles, {type: K}>, keyof CharaFile<any>>, (typeof CHARA_FILE_TYPES)[number]]
  >
}

const keys: CharaLayoutOrder = {
  layout: [
    ["layout", "array"],
    ["device", "string"],
  ],
  chords: [["chords", "array"]],
}

export const CHARA_FILE_TYPES = ["unknown", "number", "string", "array"] as const

const sep = "\n"

export async function charaFileToUriComponent<T extends CharaFiles>(file: T): Promise<string> {
  let url = `${file.type}${sep}${file.charaVersion}`

  for (const [key, type] of keys[file.type]) {
    const value = file[key as keyof T]
    url += sep
    if (type === "string") {
      url += value as string
    } else if (type === "array") {
      const stream = new Blob([serializeActionArray(value as ActionArray)])
        .stream()
        .pipeThrough(new CompressionStream("deflate"))
      url += await toBase64(await new Response(stream).blob())
    } else {
      throw new Error("Not implemented")
    }
  }

  return url
}

export async function charaFileFromUriComponent<T extends CharaFiles>(uriComponent: string): Promise<T> {
  const [fileType, version, ...values] = uriComponent.split(sep)
  const file: any = {type: fileType, version: Number(version)}

  for (const [key, type] of keys[fileType as keyof typeof keys]) {
    const value = values.pop()!
    if (type === "string") {
      file[key] = value
    } else if (type === "array") {
      const stream = (await fromBase64(value)).stream().pipeThrough(new DecompressionStream("deflate"))
      const actions = new Uint8Array(await new Response(stream).arrayBuffer())
      file[key] = deserializeActionArray(actions)
    }
  }

  return file
}
