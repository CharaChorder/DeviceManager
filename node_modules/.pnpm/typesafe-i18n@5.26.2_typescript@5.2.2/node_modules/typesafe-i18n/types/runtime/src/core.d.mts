import { type BasicPart } from '../../parser/src/basic.mjs';
type TranslationParts<T extends BaseTranslation | BaseTranslation[] = BaseTranslation> = {
    [key in keyof T]: BasicPart[];
};
export type Cache<T extends BaseTranslation | BaseTranslation[] = BaseTranslation> = TranslationParts<T>;
export type TranslationKey<T extends BaseTranslation | BaseTranslation[] = BaseTranslation> = keyof T;
declare const localized: unique symbol;
export type LocalizedString = string & {
    readonly [localized]: unknown;
};
type BaseTranslationFunction = (...args: Arguments) => LocalizedString;
export type TranslationFunctions<T extends BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]> = BaseTranslation> = {
    [key in keyof T]: T[key] extends string ? BaseTranslationFunction : T[key] extends Record<any, any> ? TranslationFunctions<T[key]> : never;
};
type TypedTranslationFunction<Translation extends string, Formatters extends BaseFormatters> = (...args: Args<Translation, keyof Formatters>) => LocalizedString;
export type TypedTranslationFunctions<T extends BaseTranslation | BaseTranslation[] | Readonly<BaseTranslation> | Readonly<BaseTranslation[]> = BaseTranslation, Formatters extends BaseFormatters = BaseFormatters> = {
    [key in keyof T]: T[key] extends string ? TypedTranslationFunction<T[key], Formatters> : T[key] extends Record<any, any> ? TranslationFunctions<T[key]> : never;
};
export type Locale = string;
export type Arguments = any[];
export type BaseTranslation = {
    [key: number]: string | BaseTranslation | BaseTranslation[] | Readonly<string> | Readonly<BaseTranslation> | Readonly<BaseTranslation[]>;
} | {
    [key: string]: string | BaseTranslation | BaseTranslation[] | Readonly<string> | Readonly<BaseTranslation> | Readonly<BaseTranslation[]>;
} | string[] | Readonly<string[]>;
export type LocaleTranslations<L extends Locale, T = unknown> = {
    [key in L]: T;
};
export type FormattersInitializer<L extends Locale, F extends BaseFormatters> = (locale: L) => F;
export type FormatterFunction<T = any, U = unknown> = (value: T) => U;
export type BaseFormatters = {
    [formatter: string]: FormatterFunction;
};
type LocaleMappingBase = {
    locale: string;
    translations: BaseTranslation | BaseTranslation[];
};
/**
 * @deprecated
 */
export type LocaleMapping = ExportLocaleMapping;
export interface ExportLocaleMapping extends LocaleMappingBase {
    namespaces: string[];
}
export interface ImportLocaleMapping extends LocaleMappingBase {
    namespaces?: string[];
}
type Permutation<T extends string, U extends string = T> = [T] extends [never] ? Array<string> : T extends U ? [T, ...Permutation<Exclude<U, T>>] : [T];
type WrapParam<P> = P extends string ? `{${P}}` : never;
type ConstructString<Params extends unknown[]> = Params extends [] ? `${string}` : Params extends [infer Param, ...infer Rest] ? `${string}${WrapParam<Param>}${ConstructString<Rest>}` : Params extends string ? Params : `${string}`;
export type RequiredParams<Params extends string> = ConstructString<Permutation<Params>>;
export declare const translate: (textParts: BasicPart[], pluralRules: Intl.PluralRules, formatters: BaseFormatters, args: Arguments) => LocalizedString;
type GetArg<Arg extends string, Type> = Arg extends '' ? void : Arg extends `${infer OptionalArg}?` ? Partial<Record<OptionalArg, Type | undefined>> : Record<Arg, Type>;
type GetCaseType<Case extends string> = Case extends '*' ? string : Case;
type ExtractCase<CaseDefinition extends string> = CaseDefinition extends `${infer Case}:${string}` ? GetCaseType<Trim<Case>> : string;
type ExtractCases<SwitchCaseDefinition extends string> = SwitchCaseDefinition extends `${infer Case},${infer Rest}` ? [ExtractCase<Case>, ...ExtractCases<Rest>] : [ExtractCase<SwitchCaseDefinition>];
type SwitchCase<Arg extends string, SwitchCaseDefinition extends string> = GetArg<Arg, ExtractCases<SwitchCaseDefinition>[number]>;
type MergePipes<A, B> = A extends string ? A : B extends string ? B : A | B;
type PipeArgumentHelper<Piped extends string, Formatters extends PropertyKey, Type> = Piped extends Formatters ? Type : Piped extends '' ? Type : `unknown Formatter '${Piped}'`;
type PipeArgument<Arg extends string, Formatters extends PropertyKey, Piped extends string, Type> = Piped extends `${infer Pipe1}|${infer Rest}` ? MergePipes<PipeArgument<Arg, Formatters, Trim<Pipe1>, Type>, PipeArgument<Arg, Formatters, Trim<Rest>, Type>> : Piped extends `{${string}` ? Piped extends `${string}}` ? Piped extends `{${infer SwitchCaseDefinition}}` ? SwitchCase<Arg, Trim<SwitchCaseDefinition>> : PipeArgumentHelper<Piped, Formatters, Type> : PipeArgument<Arg, Formatters, `${Piped}}`, Type> : PipeArgumentHelper<Piped, Formatters, Type>;
type DetectType<Type extends string> = Type extends 'string' ? string : Type extends 'number' ? number : Type extends 'number[]' ? number[] : Type extends 'Array<number>' ? Array<number> : Type extends 'boolean' ? boolean : Type extends 'boolean[]' ? boolean[] : Type extends 'Array<boolean>' ? Array<boolean> : Type extends 'Date' ? Date : Type extends 'Date[]' ? Date[] : Type extends 'Array<Date>' ? Array<Date> : Type extends 'bigint' ? bigint : Type extends 'bigint[]' ? bigint[] : Type extends 'Array<bigint>' ? Array<bigint> : Type extends 'object' ? object : Type extends 'object[]' ? object[] : Type extends 'Array<object>' ? Array<object> : Type extends 'undefined' ? undefined : Type extends 'undefined[]' ? undefined[] : Type extends 'Array<undefined>' ? Array<undefined> : Type extends 'null' ? null : Type extends 'null[]' ? null[] : Type extends 'Array<null>' ? Array<null> : Type extends 'LocalizedString' ? LocalizedString : Type extends 'LocalizedString[]' ? LocalizedString[] : Type extends 'Array<LocalizedString>' ? Array<LocalizedString> : unknown;
type Empty = ' ' | '\n' | '\t';
type TrimL<S extends string> = S extends `${Empty}${infer L}` ? TrimL<L> : S;
type TrimR<S extends string> = S extends `${infer L}${Empty}` ? TrimR<L> : S;
type Trim<S extends string> = TrimR<TrimL<S>>;
type DefineArg<Arg extends string, Formatters extends PropertyKey> = Arg extends `${infer Arg1}}${infer Arg2}` ? Merge<[DefineArg<Arg1, Formatters>], DetectArgs<Arg2, Formatters>> : Arg extends `${infer Arg}:${infer Type}|${infer Piped}` ? PipeArgument<Arg, Formatters, Trim<Piped>, GetArg<Trim<Arg>, DetectType<Trim<Type>>>> : Arg extends `${infer Arg}|${infer Piped}` ? PipeArgument<Arg, Formatters, Trim<Piped>, GetArg<Trim<Arg>, unknown>> : Arg extends `${infer Arg}:${infer Type}` ? GetArg<Trim<Arg>, DetectType<Trim<Type>>> : GetArg<Trim<Arg>, unknown>;
type DetectArg<Part extends string, Formatters extends PropertyKey> = Part extends `{${string}}` ? [] : [DefineArg<Part, Formatters>];
type Merge<A extends Array<unknown>, B extends Array<unknown>> = void extends A[number] ? void extends B[number] ? unknown : B[number] : void extends B[number] ? A[number] : A[number] & B[number];
type DetectArgs<Translation extends string, Formatters extends PropertyKey> = Translation extends `${infer Before}{{${string}}}${infer Rest}` ? [Merge<DetectArgs<Before, Formatters>, DetectArgs<Rest, Formatters>>] : Translation extends `${string}{${infer Arg}}}${infer Rest}` ? [Merge<DetectArg<`${Arg}}`, Formatters>, DetectArgs<Rest, Formatters>>] : Translation extends `${string}{${infer Arg}}${infer Rest}` ? [Merge<DetectArg<Arg, Formatters>, DetectArgs<Rest, Formatters>>] : unknown[];
export type Args<Translation extends string, Formatters extends PropertyKey> = Translation extends `${string}{${string}}${string}` ? DetectArgs<Translation, Formatters> : [];
export {};
