import type { LayoutLoad } from "./$types";
import { browser } from "$app/environment";
import { charaFileFromUriComponent } from "$lib/share/share-url";
import { themeBase, themeColor, themeSuccessBase } from "$lib/style/theme";

export const load = (async ({ url, data, fetch }) => {
  const importFile = browser && new URLSearchParams(url.search).get("import");
  return {
    themeSuccessBase,
    themeBase,
    themeColor,
    importFile: importFile
      ? await charaFileFromUriComponent(importFile, fetch)
      : undefined,
  };
}) satisfies LayoutLoad;
