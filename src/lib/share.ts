import type { Action } from "svelte/action";
import { readonly, writable } from "svelte/store";

const setCanShare = writable(false);
export const canShare = readonly(setCanShare);

let shareCallback: ((event: Event) => void) | undefined;
export function triggerShare(event: Event) {
  shareCallback?.(event);
}

export const share: Action<Window, (event: Event) => void> = (
  node,
  callback: (event: Event) => void,
) => {
  setCanShare.set(true);
  shareCallback = callback;

  return {
    destroy() {
      setCanShare.set(false);
      shareCallback = undefined;
    },
  };
};
