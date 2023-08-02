/// <references types="vite/client" />

interface ImportMetaEnv {
  readonly TAURI_FAMILY?: string
  readonly TAURI_PLATFORM_VERSION?: string
  readonly TAURI_TARGET_TRIPLE?: string
  readonly TAURI_ARCH?: string
  readonly TAURI_DEBUG?: boolean
  readonly TAURI_PLATFORM_TYPE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
