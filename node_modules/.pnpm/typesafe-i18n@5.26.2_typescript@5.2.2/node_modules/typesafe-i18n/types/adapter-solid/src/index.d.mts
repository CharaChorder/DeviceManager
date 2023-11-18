import { type Accessor, type Component, type JSX } from 'solid-js';
import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from '../../runtime/src/core.mjs';
export type I18nContextType<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    locale: Accessor<L>;
    LL: Accessor<TF>;
    setLocale: (locale: L) => void;
};
export type TypesafeI18nProps<L extends string> = {
    locale: L;
    children: JSX.Element;
};
export type SolidInit<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    TypesafeI18n: Component<TypesafeI18nProps<L>>;
    useI18nContext: () => I18nContextType<L, T, TF>;
};
export declare const initI18nSolid: <L extends string = string, T extends BaseTranslation = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>, F extends BaseFormatters = BaseFormatters>(translations: Record<L, T>, formatters?: Record<L, F>) => SolidInit<L, T, TF>;
