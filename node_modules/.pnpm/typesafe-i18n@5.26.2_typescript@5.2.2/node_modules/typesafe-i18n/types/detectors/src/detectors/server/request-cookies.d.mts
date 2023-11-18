import type { LocaleDetector } from '../../detect.mjs';
type Request = {
    cookies: string;
};
export declare const initRequestCookiesDetector: (req: Request, key?: string) => LocaleDetector;
export {};
