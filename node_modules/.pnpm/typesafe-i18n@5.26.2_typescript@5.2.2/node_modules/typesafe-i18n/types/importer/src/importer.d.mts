import type { ImportLocaleMapping, Locale } from '../../runtime/src/core.mjs';
export declare const storeTranslationToDisk: (localeMapping: ImportLocaleMapping, generateTypes?: boolean) => Promise<Locale | undefined>;
export declare const storeTranslationsToDisk: (localeMappings: ImportLocaleMapping[], generateTypes?: boolean) => Promise<Locale[]>;
