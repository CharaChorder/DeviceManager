import { initI18nSvelte } from "typesafe-i18n/svelte";
import "typesafe-i18n";
import { detectLocale as detectLocale$1 } from "typesafe-i18n/detectors";
import { initExtendDictionary } from "typesafe-i18n/utils";
const baseLocale = "en";
const locales = [
  "de",
  "en"
];
const loadedLocales = {};
const loadedFormatters = {};
initExtendDictionary();
const detectLocale = (...detectors) => detectLocale$1(baseLocale, locales, ...detectors);
const { locale, LL, setLocale } = initI18nSvelte(loadedLocales, loadedFormatters);
export {
  LL as L,
  loadedFormatters as a,
  locales as b,
  detectLocale as d,
  loadedLocales as l,
  setLocale as s
};
