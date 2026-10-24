import { describe, expect, it, vi } from "vitest";
// the same module the `virtual:pwa-register` alias resolves to
import { __registerOptions } from "../../../test/stubs/pwa-register";
import { pwaInfo } from "../../../test/stubs/pwa-info";
import { initPwa } from "./pwa-setup";

/**
 * `initPwa` registers the service worker immediately and returns the
 * manifest link tag that the root layout injects into `<head>`.
 */

describe("initPwa", () => {
  it("registers the service worker immediately", async () => {
    await initPwa();

    expect(__registerOptions).toHaveLength(1);
    expect(__registerOptions[0]).toMatchObject({ immediate: true });
  });

  it("returns the manifest link tag", async () => {
    expect(await initPwa()).toBe(pwaInfo.webManifest.linkTag);
  });

  it("logs registration errors without throwing", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await initPwa();
      const options = __registerOptions.at(-1) as {
        onRegisterError: (error: unknown) => void;
      };
      const error = new Error("registration failed");
      expect(() => options.onRegisterError(error)).not.toThrow();
      expect(log).toHaveBeenCalledWith(
        "ServiceWorker Registration Error",
        error,
      );
    } finally {
      log.mockRestore();
    }
  });
});
