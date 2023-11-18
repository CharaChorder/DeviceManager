/**
 * Compress JSON.stringify with gzip
 */
export async function stringifyCompressed<T>(chords: T): Promise<Blob> {
  const stream = new Blob([JSON.stringify(chords)]).stream().pipeThrough(new CompressionStream("gzip"))
  return await new Response(stream).blob()
}

/**
 * Decompress JSON.parse with gzip
 */
export async function parseCompressed<T>(blob: Blob): Promise<T> {
  const stream = blob.stream().pipeThrough(new DecompressionStream("deflate"))
  return await new Response(stream).json()
}

/**
 * Share JS object as url query param
 */
export async function getSharableUrl(name: string, data: any, baseHref = window.location.href): Promise<URL> {
  return new Promise(async resolve => {
    const reader = new FileReader()
    reader.onloadend = function () {
      const base64String = (reader.result as string).replace(/^data:application\/octet-stream;base64,/, "")
      const url = new URL(baseHref)
      url.searchParams.set(name, base64String)
      resolve(url)
    }
    reader.readAsDataURL(await stringifyCompressed(data))
  })
}

export async function parseSharableUrl<T>(
  name: string,
  url: string = window.location.href,
): Promise<T | undefined> {
  const searchParams = new URL(url).searchParams
  if (!searchParams.has(name)) return

  return await fetch(`data:application/octet-stream;base64,${searchParams.get(name)}`)
    .then(it => it.blob())
    .then(it => parseCompressed(it))
}
