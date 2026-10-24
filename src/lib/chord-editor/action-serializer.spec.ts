import { describe, expect, it } from "vitest";
import { actionToValue, canUseIdAsString } from "./action-serializer";

describe("canUseIdAsString", () => {
  it("accepts identifier-shaped ids", () => {
    expect(canUseIdAsString({ code: 32, id: "LEFT_CTRL" })).toBe(true);
    expect(canUseIdAsString({ code: 32, id: "a_1" })).toBe(true);
  });

  it("rejects missing ids and non-identifier ids", () => {
    expect(canUseIdAsString({ code: 32 })).toBe(false);
    expect(canUseIdAsString({ code: 32, id: "1abc" })).toBe(false);
    expect(canUseIdAsString({ code: 32, id: "A-B" })).toBe(false);
  });
});

describe("actionToValue", () => {
  it("renders single-character ids bare, escaping the markup-sensitive ones", () => {
    expect(actionToValue({ code: 32, id: "a" })).toBe("a");
    expect(actionToValue({ code: 60, id: "<" })).toBe("\\<");
    expect(actionToValue({ code: 62, id: ">" })).toBe("\\>");
    expect(actionToValue({ code: 92, id: "\\" })).toBe("\\\\");
  });

  it("wraps named ids in angle brackets", () => {
    expect(actionToValue({ code: 512, id: "LEFT_CTRL" })).toBe("<LEFT_CTRL>");
  });

  it("falls back to the hex code for unresolvable actions", () => {
    expect(actionToValue({ code: 4096 })).toBe("<0x1000>");
    expect(actionToValue(9999)).toBe("<0x270f>");
  });

  it("resolves numeric actions through the keymap", () => {
    // 512 is LEFT_CTRL in the bundled keyboard keymap
    expect(actionToValue(512)).toBe("<LEFT_CTRL>");
  });
});
