import type {LayoutLoad} from "./$types"
import {browser} from "$app/environment"
import {charaFileFromUriComponent} from "$lib/share/share-url"

export const prerender = true
export const trailingSlash = "always"

export const load = (async ({url, data, fetch}) => {
  const importFile = new URLSearchParams(url.search).get("import")
  return {
    ...data,
    importFile: browser && importFile ? await charaFileFromUriComponent(importFile, fetch) : undefined,
  }
}) satisfies LayoutLoad
