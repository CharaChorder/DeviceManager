import { themeFromSourceColor, argbFromHex, hexFromArgb } from "@material/material-color-utilities";
const themeBase = "#6D81C7";
const themeSuccessBase = "#00ff00";
const theme = themeFromSourceColor(argbFromHex(themeBase), [
  { name: "success", value: argbFromHex(themeSuccessBase), blend: true }
]);
const themeColor = hexFromArgb(theme.schemes.dark.background);
const load = async () => ({
  themeSuccessBase,
  themeBase,
  themeColor
});
export {
  load
};
