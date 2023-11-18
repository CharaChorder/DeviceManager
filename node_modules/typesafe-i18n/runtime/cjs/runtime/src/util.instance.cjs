"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = void 0;
const util_object_mjs_1 = require("./util.object.cjs");
const i18n = (translations, formatters) => {
    const cache = {};
    return new Proxy({}, {
        get: (_target, locale) => cache[locale] || (cache[locale] = (0, util_object_mjs_1.i18nObject)(locale, translations[locale], formatters[locale])),
    });
};
exports.i18n = i18n;
