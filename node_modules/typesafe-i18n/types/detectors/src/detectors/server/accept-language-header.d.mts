import type { LocaleDetector } from '../../detect.mjs';
type ObjectWithHeaders = {
    headers: {
        get: (key: string) => string | null;
    };
};
export declare const initAcceptLanguageHeaderDetector: ({ headers }: ObjectWithHeaders, headerKey?: string) => LocaleDetector;
export {};
