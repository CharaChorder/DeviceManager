/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMULATOR_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __VITEST_INCLUDED__: boolean;
