/// <references types="vite/client" />

interface ImportMetaEnv {
  readonly TAURI_FAMILY?: string;
  readonly TAURI_PLATFORM_VERSION?: string;
  readonly TAURI_TARGET_TRIPLE?: string;
  readonly TAURI_ARCH?: string;
  readonly TAURI_DEBUG?: boolean;
  readonly TAURI_PLATFORM_TYPE?: string;

  readonly VITE_HOMEPAGE_URL: string;
  readonly VITE_BUGS_URL: string;
  readonly VITE_DOCS_URL: string;
  readonly VITE_LEARN_URL: string;
  readonly VITE_LATEST_FIRMWARE: string;
  readonly VITE_STORE_URL: string;
  readonly VITE_MATRIX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
