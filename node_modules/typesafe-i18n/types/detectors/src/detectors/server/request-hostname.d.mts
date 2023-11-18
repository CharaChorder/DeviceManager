import type { LocaleDetector } from '../../detect.mjs';
type Request = {
    hostname: string;
};
export declare const initRequestHostnameDetector: (req: Request) => LocaleDetector;
export {};
