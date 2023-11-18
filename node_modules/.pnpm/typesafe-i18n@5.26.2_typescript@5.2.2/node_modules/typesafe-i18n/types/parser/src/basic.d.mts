export type BasicTextPart = string;
export type BasicArgumentPart = {
    k: string;
    i?: string | undefined;
    n?: boolean | undefined;
    f?: string[] | undefined;
};
export type BasicPluralPart = {
    k: string;
    z?: string;
    o: string;
    t?: string;
    f?: string;
    m?: string;
    r: string;
};
export type BasicPart = BasicTextPart | BasicArgumentPart | BasicPluralPart;
export declare const isBasicPluralPart: (part: Exclude<BasicPart, string>) => part is BasicPluralPart;
export declare const REGEX_SWITCH_CASE: RegExp;
export declare const parseCases: (text: string) => Record<string, string>;
export declare const removeOuterBrackets: (text: string) => string;
export declare const parseRawText: (rawText: string, optimize?: boolean, firstKey?: string, lastKey?: string) => BasicPart[];
