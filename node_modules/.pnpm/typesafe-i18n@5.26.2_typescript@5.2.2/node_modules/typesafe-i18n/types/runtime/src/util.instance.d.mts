import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from './core.mjs';
export type LocaleTranslationFunctions<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]> = BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]>, TF extends TranslationFunctions<T> = TranslationFunctions<T>> = {
    [key in L]: TF;
};
export declare const i18n: <L extends string, T extends string[] | {
    [key: number]: string | string[] | any | {
        [key: string]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    } | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<{
        [key: string]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    }> | readonly BaseTranslation[];
} | {
    [key: string]: string | string[] | {
        [key: number]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    } | any | readonly string[] | BaseTranslation[] | Readonly<{
        [key: number]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    }> | Readonly<any> | readonly BaseTranslation[];
} | readonly string[] | BaseTranslation[] | Readonly<{
    [key: number]: string | string[] | any | {
        [key: string]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    } | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<{
        [key: string]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    }> | readonly BaseTranslation[];
}> | Readonly<{
    [key: string]: string | string[] | {
        [key: number]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    } | any | readonly string[] | BaseTranslation[] | Readonly<{
        [key: number]: string | string[] | any | any | readonly string[] | BaseTranslation[] | Readonly<any> | Readonly<any> | readonly BaseTranslation[];
    }> | Readonly<any> | readonly BaseTranslation[];
}> | readonly BaseTranslation[], TF extends TranslationFunctions<T>, F extends BaseFormatters>(translations: Record<L, T>, formatters: Record<L, F>) => LocaleTranslationFunctions<L, T, TF>;
