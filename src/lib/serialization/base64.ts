/**
 * Encodes a gzipped binary blob to a base64 string.
 *
 * Note that the string is url-compatible base64,
 * meaning some chars are swapped for compatibility
 */
export async function toBase64(blob: Blob): Promise<string> {
  return new Promise(async resolve => {
    const reader = new FileReader()
    reader.onloadend = function () {
      resolve(
        `${(reader.result as string)
          .replace(/^data:application\/octet-stream;base64,/, "")
          .replaceAll("+", ".")
          .replaceAll("/", "_")
          .replaceAll("=", "-")}`,
      )
    }
    reader.readAsDataURL(blob)
  })
}

export async function fromBase64(base64: string): Promise<Blob> {
  return fetch(
    `data:application/octet-stream;base64,${base64
      .replaceAll(".", "+")
      .replaceAll("_", "/")
      .replaceAll("-", "=")}`,
  ).then(it => it.blob())
}
