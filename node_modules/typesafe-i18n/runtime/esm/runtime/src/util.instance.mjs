import { i18nObject } from './util.object.mjs';
export const i18n = (translations, formatters) => {
    const cache = {};
    return new Proxy({}, {
        get: (_target, locale) => cache[locale] || (cache[locale] = i18nObject(locale, translations[locale], formatters[locale])),
    });
};
