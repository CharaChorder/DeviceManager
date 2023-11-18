import type { Logger } from './logger.mjs';
export type TypescriptVersion = {
    major: number;
    minor: number;
};
export declare const parseTypescriptVersion: (versionMajorMinor: `${number}.${number}`) => TypescriptVersion;
export declare const sanitizePath: <Type extends string>(part: Type) => Type;
export declare const wrapObjectKeyIfNeeded: (key: string) => string;
export declare const prettify: (content: string) => string;
export declare const runCommandAfterGenerator: (logger: Logger, runAfterGenerator: string) => void;
