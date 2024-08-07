import type { LayoutLoad } from "./$types";
import { browser } from "$app/environment";
import { charaFileFromUriComponent } from "$lib/share/share-url";

export const load = (async ({ url, data, fetch }) => {
  const importFile = browser && new URLSearchParams(url.search).get("import");
  return {
    ...data,
    importFile: importFile
      ? await charaFileFromUriComponent(importFile, fetch)
      : undefined,
  };
}) satisfies LayoutLoad;
