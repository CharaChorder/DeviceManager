import type { GeneratorConfig, GeneratorConfigWithDefaultValues } from './types.mjs';
export declare const writeConfigToFile: (config: GeneratorConfig) => Promise<void>;
export declare const doesConfigFileExist: () => Promise<boolean>;
export declare const readRawConfig: () => Promise<GeneratorConfig & {
    $schema?: string;
}>;
export declare const readConfig: () => Promise<GeneratorConfig>;
export declare const getConfigWithDefaultValues: (config?: GeneratorConfig | undefined, shouldReadConfigFromDisk?: boolean) => Promise<GeneratorConfigWithDefaultValues>;
