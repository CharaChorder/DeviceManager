import type { GeneratorConfigWithDefaultValues } from '../../config/src/types.mjs';
import type { BaseTranslation, Locale } from '../../runtime/src/core.mjs';
import type { TypescriptVersion } from './utils/generator.utils.mjs';
import { type Logger } from './utils/logger.mjs';
export declare const generateNamespaceFiles: (config: GeneratorConfigWithDefaultValues, locales: string[] | undefined, namespaces: string[] | undefined, forceOverride: boolean) => Promise<void>;
export declare const generate: (translations: BaseTranslation | BaseTranslation[], config: GeneratorConfigWithDefaultValues | undefined, version: TypescriptVersion, logger?: Logger, forceOverride?: boolean, locales?: Locale[], namespaces?: string[]) => Promise<void>;
