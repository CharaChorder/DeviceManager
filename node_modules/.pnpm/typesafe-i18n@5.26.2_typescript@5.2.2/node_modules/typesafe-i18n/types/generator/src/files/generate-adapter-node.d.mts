import type { GeneratorConfigWithDefaultValues } from '../../../config/src/types.mjs';
export declare const getNodeUtils: ({ utilFileName, banner, typesFileName }: GeneratorConfigWithDefaultValues) => string;
export declare const generateNodeAdapter: (config: GeneratorConfigWithDefaultValues) => Promise<void>;
