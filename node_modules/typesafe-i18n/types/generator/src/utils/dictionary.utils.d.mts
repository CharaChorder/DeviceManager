import type { GeneratorConfigWithDefaultValues } from '../../../config/src/types.mjs';
import type { BaseTranslation, Locale } from '../../../runtime/src/core.mjs';
export declare const getDictionaryTemplate: ({ banner, typesFileName }: GeneratorConfigWithDefaultValues, locale: Locale, namespace: string | undefined, isBaseLocale: boolean, translations?: BaseTranslation | BaseTranslation[] | undefined, editHint?: string, showBanner?: boolean) => string;
export declare const mapTranslationsToString: (translations: BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]>, level?: number) => string;
export declare const getWrappedString: (text: string, lookForStringType?: boolean) => string;
