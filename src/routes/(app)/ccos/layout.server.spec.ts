import { describe, expect, it } from "vitest";
import { prerender } from "./+layout.server";

describe("ccos layout server", () => {
  it("is excluded from prerendering (dynamic firmware listing)", () => {
    expect(prerender).toBe(false);
  });
});
