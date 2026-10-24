import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { preference, theme, userPreferences } from "./preferences";

describe("user preferences", () => {
  it("should ship with the documented defaults", () => {
    expect(get(theme)).toEqual({ color: "#6D81C7", mode: "dark" });
    expect(get(userPreferences)).toEqual({ backup: false, autoConnect: false });
  });

  it("should bind a checkbox to a preference key", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    const { destroy } = (
      preference as unknown as (
        node: HTMLInputElement,
        key: string,
      ) => { destroy: () => void }
    )(input, "backup");

    // initial sync from the store
    expect(input.checked).toBe(false);

    input.checked = true;
    input.dispatchEvent(new Event("input"));
    expect(get(userPreferences).backup).toBe(true);

    userPreferences.update((it) => ({ ...it, backup: false }));
    expect(input.checked).toBe(false);

    destroy();
    input.checked = true;
    input.dispatchEvent(new Event("input"));
    expect(get(userPreferences).backup).toBe(false);
  });
});
