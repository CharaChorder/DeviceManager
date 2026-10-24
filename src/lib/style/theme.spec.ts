import { describe, expect, it } from "vitest";
import { themeBase, themeColor, themeSuccessBase } from "./theme";

describe("theme", () => {
  it("uses the documented source colors", () => {
    expect(themeBase).toBe("#6D81C7");
    expect(themeSuccessBase).toBe("#00ff00");
  });

  it("derives a hex color from the generated scheme", () => {
    expect(themeColor).toMatch(/^#[\da-f]{6}$/i);
    // background is not simply the source color
    expect(themeColor).not.toBe(themeBase);
  });
});
