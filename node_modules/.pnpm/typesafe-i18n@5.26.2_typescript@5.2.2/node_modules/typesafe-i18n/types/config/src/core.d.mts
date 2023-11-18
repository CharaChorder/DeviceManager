import { type FileSystemUtil } from '../../shared/src/file.utils.mjs';
import type { GeneratorConfig, GeneratorConfigWithDefaultValues } from './types.mjs';
export declare const applyDefaultValues: (config?: GeneratorConfig | undefined) => Promise<GeneratorConfigWithDefaultValues>;
export declare const getConfig: (fs: FileSystemUtil) => Promise<GeneratorConfigWithDefaultValues>;
export declare const getLocaleInformation: (fs: FileSystemUtil) => Promise<{
    base: string;
    locales: string[];
}>;
