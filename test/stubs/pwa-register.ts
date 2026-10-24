// Test stub for the `virtual:pwa-register/*` virtual modules (the PWA plugin
// provides the real ones only in the Vite build). The __pwa handles let tests
// drive the update/offline states; __updateCalls records reload requests.
import { writable, type Writable } from "svelte/store";

export const __pwa: {
  needRefresh: Writable<boolean>;
  offlineReady: Writable<boolean>;
} = {
  needRefresh: writable(false),
  offlineReady: writable(false),
};

export const __updateCalls: boolean[] = [];

export const __registerOptions: unknown[] = [];

export function registerSW(options?: unknown) {
  __registerOptions.push(options);
}

export function useRegisterSW() {
  return {
    needRefresh: __pwa.needRefresh,
    offlineReady: __pwa.offlineReady,
    updateServiceWorker: (reload?: boolean) => {
      __updateCalls.push(reload ?? false);
      return Promise.resolve();
    },
  };
}

export default useRegisterSW;
