import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import {
  KEYMAP_CATEGORIES,
  KEYMAP_CODES,
  KEYMAP_KEYCODES,
} from "./keymap-codes";
import { deviceMeta } from "./connection";
import type { VersionMeta } from "$lib/meta/types/meta";
import type { KeymapCategory } from "$lib/assets/keymaps/keymap";

const fakeCategory: KeymapCategory = {
  name: "Fake",
  description: "fake keymap",
  icon: "x",
  actions: {
    "777": { id: "FAKE_ACTION", title: "Fake action" },
  },
};

describe("keymap codes", () => {
  it("should fall back to the bundled keymaps", () => {
    const categories = get(KEYMAP_CATEGORIES);
    expect(categories.length).toBeGreaterThan(0);

    // LEFT_CTRL from keyboard.yml
    expect(KEYMAP_CODES && get(KEYMAP_CODES).get(512)?.id).toBe("LEFT_CTRL");
  });

  it("should prefer the connected device's meta actions", () => {
    deviceMeta.set({
      actions: [fakeCategory],
    } as unknown as VersionMeta);
    try {
      const codes = get(KEYMAP_CODES);
      expect(codes.get(777)?.id).toBe("FAKE_ACTION");
      expect(codes.get(777)?.code).toBe(777);
      expect(codes.get(777)?.category).toBe(fakeCategory);
    } finally {
      deviceMeta.set(undefined);
    }
  });

  it("should expose the fallback again after the meta is cleared", () => {
    deviceMeta.set({ actions: [fakeCategory] } as unknown as VersionMeta);
    deviceMeta.set(undefined);
    expect(get(KEYMAP_CODES).get(512)?.id).toBe("LEFT_CTRL");
  });
});

describe("keymap keycodes", () => {
  it("indexes actions by their keyboard code", () => {
    const keycodes = get(KEYMAP_KEYCODES);
    expect(keycodes.get("ControlLeft")).toBe(512);
    expect(keycodes.get("ShiftLeft")).toBe(513);
    // codes appearing in several categories collapse to the last definition
    expect([44, 310]).toContain(keycodes.get("Comma"));
    // the scancode category indexes physical keys by keyboard code
    expect(keycodes.get("KeyA")).toBe(260);
  });

  it("follows the connected device's meta actions", () => {
    deviceMeta.set({
      actions: [
        {
          name: "Fake",
          description: "fake",
          icon: "x",
          actions: {
            "900": { id: "FAKE_KEY", title: "fake", keyCode: "IntlBackslash" },
            "901": { id: "NO_KEYCODE", title: "none" },
          },
        },
      ],
    } as unknown as VersionMeta);
    try {
      expect(get(KEYMAP_KEYCODES).get("IntlBackslash")).toBe(900);
      expect(get(KEYMAP_KEYCODES).has("NO_KEYCODE")).toBe(false);
    } finally {
      deviceMeta.set(undefined);
    }
  });
});
