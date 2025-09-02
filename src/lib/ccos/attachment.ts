import type { Attachment } from "svelte/attachments";
import { browser } from "$app/environment";
import { persistentWritable } from "$lib/storage";

export const emulatedCCOS = persistentWritable("emulatedCCOS", false);

export function ccosKeyInterceptor() {
  return ((element: Window) => {
    const ccos = browser
      ? import("./ccos").then((module) => module.fetchCCOS(".test"))
      : Promise.resolve(undefined);

    function onEvent(event: KeyboardEvent) {
      ccos.then((it) => it?.handleKeyEvent(event));
    }

    element.addEventListener("keydown", onEvent, true);
    element.addEventListener("keyup", onEvent, true);

    return () => {
      ccos.then((it) => it?.destroy());
      element.removeEventListener("keydown", onEvent, true);
      element.removeEventListener("keyup", onEvent, true);
    };
  }) satisfies Attachment<Window>;
}
