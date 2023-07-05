import {themeBase, themeColor, themeSuccessBase} from "$lib/style/theme.server.js"

/** @type {import("./$types").LayoutServerLoad} */
export async function load() {
  return {
    themeSuccessBase,
    themeBase,
    themeColor,
  }
}
