import type { ExportLocaleMapping, Locale } from '../../runtime/src/core.mjs';
export declare const readTranslationFromDisk: (locale: Locale) => Promise<ExportLocaleMapping>;
export declare const readTranslationsFromDisk: () => Promise<ExportLocaleMapping[]>;
