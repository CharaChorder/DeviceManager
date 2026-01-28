import type { Attachment } from "svelte/attachments";
import type { CharaDevice } from "$lib/serial/device";
import type { CCOS, CCOSKeyboardEvent } from "./ccos";
import type { ReplayRecorder } from "$lib/charrecorder/core/recorder";

export function ccosKeyInterceptor(
  port: CharaDevice | undefined,
  recorder: ReplayRecorder,
) {
  return ((element: HTMLElement) => {
    const ccos =
      port?.port && "handleKeyEvent" in port?.port
        ? (port.port as CCOS)
        : undefined;
    console.log("Attaching CCOS key interceptor", ccos);

    function onEvent(event: KeyboardEvent) {
      ccos?.handleKeyEvent(event);
      if (!event.defaultPrevented) {
        recorder.next(event);
      }
    }

    if (ccos) {
      element.addEventListener("keydown", onEvent, true);
      element.addEventListener("keyup", onEvent, true);
      element.add;
    }

    return () => {
      element.removeEventListener("keydown", onEvent, true);
      element.removeEventListener("keyup", onEvent, true);
    };
  }) satisfies Attachment<HTMLElement>;
}
