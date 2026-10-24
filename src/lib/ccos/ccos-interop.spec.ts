import { describe, expect, it } from "vitest";
import { KEYCODE_TO_SCANCODE, SCANCODE_TO_KEYCODE } from "./ccos-interop";

describe("ccos interop maps", () => {
  it("maps the home row letters to their HID scancodes", () => {
    expect(KEYCODE_TO_SCANCODE.get("KeyA")).toBe(0x04);
    expect(KEYCODE_TO_SCANCODE.get("KeyZ")).toBe(0x1d);
  });

  it("maps digits to the scancodes shifted by one row", () => {
    expect(KEYCODE_TO_SCANCODE.get("Digit1")).toBe(0x1e);
    expect(KEYCODE_TO_SCANCODE.get("Digit0")).toBe(0x27);
  });

  it("is consistent in both directions", () => {
    for (const [code, sc] of KEYCODE_TO_SCANCODE) {
      if (sc === undefined) continue;
      expect(SCANCODE_TO_KEYCODE.get(sc), `scancode ${sc}`).toBe(code);
    }
  });

  it("keeps the inverse maps within the HID usage range", () => {
    for (const [sc, code] of SCANCODE_TO_KEYCODE) {
      expect(sc).toBeGreaterThanOrEqual(0x04);
      expect(sc).toBeLessThanOrEqual(0xe7);
      expect(KEYCODE_TO_SCANCODE.has(code), code).toBe(true);
    }
  });
});
