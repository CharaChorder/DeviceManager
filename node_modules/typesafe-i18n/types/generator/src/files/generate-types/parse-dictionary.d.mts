import type { BaseTranslation } from '../../../../runtime/src/index.mjs';
import type { ParsedResult } from '../../types.mjs';
import type { Logger } from '../../utils/logger.mjs';
export declare const parseDictionary: (translations: BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]>, logger: Logger, parentKeys?: string[]) => ParsedResult[];
