import { describe, expect, it } from "vitest";
import { isVerbose } from "./verbose-action";
import type { KeyInfo } from "$lib/serial/keymap-codes";

const info = (over: Partial<KeyInfo>): KeyInfo => ({ code: 32, ...over });

describe("isVerbose", () => {
  it("is not verbose for single-character ids", () => {
    expect(isVerbose(info({ id: "A", title: "Letter A" }))).toBe(false);
  });

  it("is not verbose without a title", () => {
    expect(isVerbose(info({ id: "LEFT_CTRL" }))).toBeFalsy();
  });

  it("is not verbose for function key ids", () => {
    expect(isVerbose(info({ id: "F12", title: "Function key 12" }))).toBe(
      false,
    );
  });

  it("is verbose for named multi-character ids", () => {
    expect(isVerbose(info({ id: "LEFT_CTRL", title: "Control" }))).toBe(true);
  });

  it("is verbose without an id when a title is set", () => {
    expect(isVerbose(info({ title: "Custom chord output" }))).toBe(true);
  });
});
