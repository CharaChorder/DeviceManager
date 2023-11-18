import type { Arguments } from '../../../runtime/src/core.mjs';
export type Logger = {
    info: (...messages: Arguments) => void;
    warn: (...messages: Arguments) => void;
    error: (...messages: Arguments) => void;
};
export declare const createLogger: (console: Console, throwOnError?: boolean) => Logger;
export declare const logger: Logger;
