import type { Readable } from 'svelte/store';
import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from '../../runtime/src/core.mjs';
export type SvelteStoreInit<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    locale: Readable<L>;
    LL: Readable<TF>;
    setLocale: (locale: L) => void;
};
export declare const initI18nSvelte: <L extends string = string, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>, F extends BaseFormatters = BaseFormatters>(translations: Record<L, T>, formatters?: Record<L, F>) => SvelteStoreInit<L, T, TF>;
