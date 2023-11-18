import type { OutputFormats } from '../../config/src/types.mjs';
import type { Locale } from '../../runtime/src/core.mjs';
import type { BaseTranslation } from '../../runtime/src/index.mjs';
export declare const parseLanguageFile: (outputPath: string, outputFormat: OutputFormats, typesFileName: string, tempPath: string, locale: Locale, namespace?: string) => Promise<BaseTranslation | null>;
