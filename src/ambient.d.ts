// The PWA plugin provides these virtual modules only in the Vite build;
// vitest aliases them to the test stub (see vitest.config.ts).
declare module "virtual:pwa-register/svelte" {
  import type { Writable } from "svelte/store";
  export const __pwa: {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
  };
  export const __updateCalls: boolean[];
  export function useRegisterSW(): {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
    updateServiceWorker: (reload?: boolean) => Promise<void>;
  };
}

declare module "virtual:pwa-register" {
  import type { Writable } from "svelte/store";
  export const __pwa: {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
  };
  export const __updateCalls: boolean[];
  export function useRegisterSW(): {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
    updateServiceWorker: (reload?: boolean) => Promise<void>;
  };
}
