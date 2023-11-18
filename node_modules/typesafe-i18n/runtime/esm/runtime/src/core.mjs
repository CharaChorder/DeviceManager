import { REGEX_SWITCH_CASE, isBasicPluralPart, parseCases, } from '../../parser/src/basic.mjs';
// --------------------------------------------------------------------------------------------------------------------
// implementation -----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
const applyFormatters = (formatters, formatterKeys, initialValue) => formatterKeys.reduce((value, formatterKey) => {
    var _a, _b;
    return (_b = (formatterKey.match(REGEX_SWITCH_CASE)
        ? ((cases) => { var _a; return (_a = cases[value]) !== null && _a !== void 0 ? _a : cases['*']; })(parseCases(formatterKey))
        : (_a = formatters[formatterKey]) === null || _a === void 0 ? void 0 : _a.call(formatters, value))) !== null && _b !== void 0 ? _b : value;
}, initialValue);
const getPlural = (pluralRules, { z, o, t, f, m, r }, value) => {
    switch (z && value == 0 ? 'zero' : pluralRules.select(value)) {
        case 'zero':
            return z;
        case 'one':
            return o;
        case 'two':
            return t;
        case 'few':
            return f !== null && f !== void 0 ? f : r;
        case 'many':
            return m !== null && m !== void 0 ? m : r;
        default:
            return r;
    }
};
const REGEX_PLURAL_VALUE_INJECTION = /\?\?/g;
const applyArguments = (textParts, pluralRules, formatters, args) => textParts
    .map((part) => {
    if (typeof part === 'string') {
        return part;
    }
    const { k: key = '0', f: formatterKeys = [] } = part;
    const value = args[key];
    if (isBasicPluralPart(part)) {
        return ((typeof value === 'boolean' ? (value ? part.o : part.r) : getPlural(pluralRules, part, value)) || '').replace(REGEX_PLURAL_VALUE_INJECTION, value);
    }
    const formattedValue = formatterKeys.length ? applyFormatters(formatters, formatterKeys, value) : value;
    return ('' + (formattedValue !== null && formattedValue !== void 0 ? formattedValue : '')).trim();
})
    .join('');
export const translate = (textParts, pluralRules, formatters, args) => {
    const firstArg = args[0];
    const isObject = firstArg && typeof firstArg === 'object' && firstArg.constructor === Object;
    const transformedArgs = (args.length === 1 && isObject ? firstArg : args);
    return applyArguments(textParts, pluralRules, formatters, transformedArgs);
};
// type TransformArgsArray<A extends Array<Record<string, unknown>>> = keyof A[0] extends `${number}`
// 	? ToIndexBasedArgs<A>
// 	: A
// type ToIndexBasedArgs<A extends Array<Record<string, unknown>>, B extends keyof A[0] = keyof A[0]> = GetTypesFromRecord<
// 	A[0],
// 	Sort<ToNumberArray<ToTuple<B>>>
// >
// type GetTypesFromRecordAsArray<A extends Record<string, unknown>, B extends unknown[]> = B extends [infer Item, ...infer Rest]
// 	? [A[Item], ...XX<A, Rest>]
// 	: []
// type UnionToParm<U> = U extends any ? (k: U) => void : never
// type UnionToSect<U> = UnionToParm<U> extends (k: infer I) => void ? I : never
// type ExtractParm<F> = F extends { (a: infer A): void } ? A : never
// type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>
// type ExtractOne<Union> = ExtractParm<UnionToSect<UnionToParm<Union>>>
// type ToTuple<Union> = ToTupleRec<Union, []>
// type ToTupleRec<Union, Rslt extends any[]> = SpliceOne<Union> extends never
// 	? [ExtractOne<Union>, ...Rslt]
// 	: ToTupleRec<SpliceOne<Union>, [ExtractOne<Union>, ...Rslt]>
// type GenList<N, A extends any[] = []> = N extends A['length'] ? A : GenList<N, [0, ...A]>
// // Add lists of size: [1, 2] -> [[1, [_]], [2, [_, _]]]
// type Expand<T extends any[]> = T extends [infer Head, ...infer Rest] ? [[Head, GenList<Head>], ...Expand<Rest>] : []
// // Drop one from each list, remove whole pair for empty: [[1, [_]], [0, []], [2, [_, _]]] -> [[1, []], [2, [_]]]
// type DropAndFilter<T> = T extends [infer First, ...infer Rest]
// 	? First extends [any, []]
// 		? DropAndFilter<Rest>
// 		: First extends [infer N, [any, ...infer NREST]]
// 		? [[N, NREST], ...DropAndFilter<Rest>]
// 		: []
// 	: []
// // [[1, []], [2, [_]]] -> [1]
// type FindEmpty<T> = T extends [infer First, ...infer Rest]
// 	? First extends [infer N, []]
// 		? [N, ...FindEmpty<Rest>]
// 		: FindEmpty<Rest>
// 	: []
// // Sort expanded
// type Condense<T extends [number, any[]][], Result extends number[] = []> = T extends []
// 	? Result
// 	: Condense<DropAndFilter<T>, [...Result, ...FindEmpty<T>]>
// type Reverse<A extends any[]> = A extends [infer H, ...infer T] ? [...Reverse<T>, H] : []
// type Sort<T extends any[], R = false> = R extends true ? Reverse<Condense<Expand<T>>> : Condense<Expand<T>>
// type ToNumberArray<T extends unknown[]> = T extends [infer Item, ...infer Rest]
// 	? [ToNumber<Item>, ...ToNumberArray<Rest>]
// 	: []
// type ToNumber<S, L extends number[] = []> = `${L['length']}` extends S ? L['length'] : ToNumber<S, [...L, 0]>
