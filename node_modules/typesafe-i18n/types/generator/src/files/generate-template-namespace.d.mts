import type { GeneratorConfigWithDefaultValues } from '../../../config/src/types.mjs';
import type { BaseTranslation, Locale } from '../../../runtime/src/core.mjs';
export declare const generateNamespaceTemplate: (config: GeneratorConfigWithDefaultValues, locale: Locale, namespace: string, translations?: BaseTranslation | BaseTranslation[] | undefined, editHint?: string, showBanner?: boolean) => Promise<void>;
