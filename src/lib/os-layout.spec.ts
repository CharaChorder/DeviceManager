import { describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { osLayout, runLayoutDetection } from "./os-layout";

describe("os layout detection", () => {
  it("should adopt the OS keyboard layout", async () => {
    const layout = new Map([
      ["KeyA", "a"],
      ["KeyQ", "q"],
    ]);
    const keyboard = { getLayoutMap: async () => layout };
    Object.defineProperty(navigator, "keyboard", {
      value: keyboard,
      configurable: true,
    });

    const stop = runLayoutDetection();
    await vi.waitFor(() => expect(get(osLayout)).toBe(layout));
    stop();

    Reflect.deleteProperty(navigator, "keyboard");
  });

  it("should degrade gracefully without the Keyboard API", () => {
    Reflect.deleteProperty(navigator, "keyboard");
    expect("keyboard" in navigator).toBe(false);
    expect(typeof runLayoutDetection()).toBe("function");
  });
});
