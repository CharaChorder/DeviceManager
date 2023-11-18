import { type ParsedResult, type ParsedResultEntry } from '../../types.mjs';
export declare const getNestedKey: (key: string, parentKeys: string[]) => string;
export declare const mapToString: <T>(items: T[], mappingFunction: (item: T) => string) => string;
export declare const wrapObjectType: <T>(array: T[], callback: () => string) => string;
export declare const wrapUnionType: (array: string[]) => string;
export declare const flattenToParsedResultEntry: (parsedResults: ParsedResult[]) => ParsedResultEntry[];
export declare const processNestedParsedResult: (items: Exclude<ParsedResult, ParsedResultEntry>, mappingFunction: (item: ParsedResult) => string) => string;
