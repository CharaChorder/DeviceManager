import { translate } from './core.mjs';
import { getPartsFromString } from './util.string.mjs';
const getTranslateInstance = (locale, formatters) => {
    const cache = {};
    const pluralRules = new Intl.PluralRules(locale);
    return (text, ...args) => translate(getPartsFromString(cache, text), pluralRules, formatters, args);
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function i18nObject(locale, translations, formatters = {}) {
    return createProxy(translations, getTranslateInstance(locale, formatters));
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function typesafeI18nObject(locale, translations, formatters = {}) {
    return createProxy(translations, getTranslateInstance(locale, formatters));
}
const wrap = (proxyObject = {}, translateFn) => (typeof proxyObject === 'string'
    ? translateFn.bind(null, proxyObject)
    : Object.assign(Object.defineProperty(() => '', 'name', { writable: true }), proxyObject));
/* PROXY-START */
const createProxy = (proxyObject, translateFn) => new Proxy(wrap(proxyObject, translateFn), {
    get: (target, key) => {
        if (key === Symbol.iterator)
            return [][Symbol.iterator].bind(Object.values(target).map((entry) => wrap(entry, translateFn)));
        return createProxy(target[key], translateFn);
    },
});
/* PROXY-END */

