import type { GeneratorConfigWithDefaultValues } from '../../../config/src/types.mjs';
import type { BaseTranslation, Locale } from '../../../runtime/src/core.mjs';
import type { Logger } from '../utils/logger.mjs';
export type GenerateTypesType = GeneratorConfigWithDefaultValues & {
    translations: BaseTranslation | BaseTranslation[];
    locales: Locale[];
    namespaces: string[];
};
export declare const generateTypes: (config: GenerateTypesType, logger: Logger) => Promise<boolean>;
