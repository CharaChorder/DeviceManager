import type { LocaleDetector } from '../../detect.mjs';
type Request = {
    params: Record<string, string>;
};
export declare const initRequestParametersDetector: (req: Request, key?: string) => LocaleDetector;
export {};
