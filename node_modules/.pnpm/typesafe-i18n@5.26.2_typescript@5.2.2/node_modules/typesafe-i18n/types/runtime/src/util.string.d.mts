import type { BasicPart } from '../../parser/src/basic.mjs';
import type { Args, Arguments, BaseFormatters, Cache, LocalizedString } from './core.mjs';
export type TranslateByString = (text: string, ...args: Arguments) => LocalizedString;
export declare const getPartsFromString: (cache: Cache, text: string) => BasicPart[];
export declare const i18nString: <L extends string, F extends BaseFormatters>(locale: L, formatters?: F) => TranslateByString;
export declare const typesafeI18nString: <L extends string, F extends BaseFormatters>(locale: L, formatters?: F) => <Translation extends string>(text: Translation, ...args: Args<Translation, keyof F>) => LocalizedString;
