/// <reference types="react" />
import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from '../../runtime/src/core.mjs';
export type I18nContextType<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    locale: L;
    LL: TF;
    setLocale: (locale: L) => void;
};
export type TypesafeI18nProps<L extends string> = {
    locale: L;
    children: React.ReactNode;
};
export type ReactInit<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    component: React.FunctionComponent<TypesafeI18nProps<L>>;
    context: React.Context<I18nContextType<L, T, TF>>;
};
export declare const initI18nReact: <L extends string = string, T extends BaseTranslation = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>, F extends BaseFormatters = BaseFormatters>(translations: Record<L, T>, formatters?: Record<L, F>) => ReactInit<L, T, TF>;
