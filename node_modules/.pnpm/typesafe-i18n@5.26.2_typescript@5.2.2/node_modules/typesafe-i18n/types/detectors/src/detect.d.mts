export type LocaleDetector = () => string[];
export declare const detectLocale: <L extends string>(baseLocale: L, availableLocales: L[], ...detectors: LocaleDetector[]) => L;
