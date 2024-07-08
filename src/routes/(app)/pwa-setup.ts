import type { RegisterSWOptions } from "vite-plugin-pwa/types";

export async function initPwa(): Promise<string> {
  // @ts-expect-error confused TS
  const { pwaInfo } = await import("virtual:pwa-info");
  // @ts-expect-error confused TS
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.log("ServiceWorker Registration Error", error);
    },
  } satisfies RegisterSWOptions);

  return pwaInfo ? pwaInfo.webManifest.linkTag : "";
}
