import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { inputToAction } from "./input-converter";
import { KEYMAP_IDS, KEYMAP_KEYCODES } from "$lib/serial/keymap-codes";

describe("inputToAction", () => {
  it("maps printable keys via the id map", () => {
    const event = new KeyboardEvent("keydown", { key: "a", code: "KeyA" });
    expect(inputToAction(event)).toBe(get(KEYMAP_IDS).get("a")?.code);
    expect(inputToAction(event)).toBe(97);
  });

  it("maps by keyboard code when keycodes are requested", () => {
    const event = new KeyboardEvent("keydown", {
      key: "Control",
      code: "ControlLeft",
    });
    expect(inputToAction(event, true)).toBe(
      get(KEYMAP_KEYCODES).get("ControlLeft"),
    );
    expect(inputToAction(event, true)).toBe(512);
  });

  it("falls back to the keycode map for unknown key ids", () => {
    // "π" is not an id in any bundled keymap; its code maps via keycodes
    const event = new KeyboardEvent("keydown", { key: "π", code: "Comma" });
    expect(get(KEYMAP_IDS).get("π")).toBeUndefined();
    expect(inputToAction(event)).toBe(get(KEYMAP_KEYCODES).get("Comma"));
  });

  it("returns undefined for unmapped input", () => {
    const event = new KeyboardEvent("keydown", {
      key: "Dead",
      code: "Unmapped",
    });
    expect(inputToAction(event)).toBeUndefined();
    expect(inputToAction(event, true)).toBeUndefined();
  });
});
