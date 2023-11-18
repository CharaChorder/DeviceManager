import { parseRawText } from '../../parser/src/basic.mjs';
import { translate } from './core.mjs';
export const getPartsFromString = (cache, text) => cache[text] || (cache[text] = parseRawText(text));
const translateString = (cache, pluralRules, formatters, text, ...args) => translate(getPartsFromString(cache, text), pluralRules, formatters, args);
export const i18nString = (locale, formatters = {}) => translateString.bind(null, {}, new Intl.PluralRules(locale), formatters);
export const typesafeI18nString = (locale, formatters = {}) => translateString.bind(null, {}, new Intl.PluralRules(locale), formatters);
