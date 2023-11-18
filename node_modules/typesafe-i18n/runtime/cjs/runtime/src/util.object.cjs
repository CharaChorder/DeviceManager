"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typesafeI18nObject = exports.i18nObject = void 0;
const core_mjs_1 = require("./core.cjs");
const util_string_mjs_1 = require("./util.string.cjs");
const getTranslateInstance = (locale, formatters) => {
    const cache = {};
    const pluralRules = new Intl.PluralRules(locale);
    return (text, ...args) => (0, core_mjs_1.translate)((0, util_string_mjs_1.getPartsFromString)(cache, text), pluralRules, formatters, args);
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
function i18nObject(locale, translations, formatters = {}) {
    return createProxy(translations, getTranslateInstance(locale, formatters));
}
exports.i18nObject = i18nObject;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
function typesafeI18nObject(locale, translations, formatters = {}) {
    return createProxy(translations, getTranslateInstance(locale, formatters));
}
exports.typesafeI18nObject = typesafeI18nObject;
const wrap = (proxyObject = {}, translateFn) => (typeof proxyObject === 'string'
    ? translateFn.bind(null, proxyObject)
    : Object.assign(Object.defineProperty(() => '', 'name', { writable: true }), proxyObject));

/* PROXY-CJS-START */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createProxy = (proxyObject = {}, translateFn) => new Proxy(wrap(proxyObject, translateFn), {
    get: (target, key) => {
        if (key === 'then')
            return null;
        if (key === Symbol.iterator)
            return [][Symbol.iterator].bind(Object.values(target).map((entry) => wrap(entry, translateFn)));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return createProxy(target[key], translateFn);
    },
});
/* PROXY-CJS-END */
