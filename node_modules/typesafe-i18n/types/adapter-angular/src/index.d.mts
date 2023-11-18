import type { BaseFormatters, BaseTranslation, Locale, TranslationFunctions } from '../../runtime/src/core.mjs';
export declare class I18nServiceRoot<L extends Locale = Locale, T extends BaseTranslation | BaseTranslation[] = BaseTranslation, TF extends TranslationFunctions<T> = TranslationFunctions<T>, F extends BaseFormatters = BaseFormatters> {
    #private;
    private translations;
    private formatters;
    constructor(translations: Record<L, T>, formatters: Record<L, F>);
    get locale(): L;
    get LL(): TF;
    setLocale(newLocale: L): void;
}
