import type { App, inject, Ref, ref } from 'vue';
import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from '../../runtime/src/core.mjs';
type Provider<L extends string, T extends BaseTranslation | BaseTranslation[], TF extends TranslationFunctions<T>> = {
    locale: Ref<L>;
    LL: Ref<TF>;
    setLocale: (locale: L) => void;
};
type I18nPlugin<L extends string> = {
    install: (app: App, locale: L) => void;
};
export type VuePluginInit<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    typesafeI18n: () => Provider<L, T, TF>;
    i18nPlugin: I18nPlugin<L>;
};
export declare const initI18nVuePlugin: <L extends string = string, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>, F extends BaseFormatters = BaseFormatters>(vueInject: typeof inject, vueRef: typeof ref, translations: Record<L, T>, formatters?: Record<L, F>) => VuePluginInit<L, T, TF>;
export {};
