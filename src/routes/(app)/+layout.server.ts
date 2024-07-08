import {
  themeBase,
  themeColor,
  themeSuccessBase,
} from "$lib/style/theme.server";
import type { LayoutServerLoad } from "./$types";

export const load = (async () => ({
  themeSuccessBase,
  themeBase,
  themeColor,
})) satisfies LayoutServerLoad;
