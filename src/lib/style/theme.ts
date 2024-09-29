import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from "@material/material-color-utilities";

export const themeBase = "#6D81C7";
export const themeSuccessBase = "#00ff00";

const theme = themeFromSourceColor(argbFromHex(themeBase), [
  { name: "success", value: argbFromHex(themeSuccessBase), blend: true },
]);

export const themeColor = hexFromArgb(theme.schemes.dark.background);
