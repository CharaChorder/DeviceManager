import type { ParsedMessage, PluralPart } from './types.mjs';
export declare const serializeMessage: (parts: ParsedMessage) => string;
export declare const serializeMessageWithoutTypes: (parts: ParsedMessage) => string;
export declare const serializePluralPart: ({ zero, one, two, few, many, other }: PluralPart) => string;
