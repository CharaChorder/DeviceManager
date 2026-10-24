import { describe, expect, it } from "vitest";
import { prerender, trailingSlash } from "./+layout";

describe("root layout config", () => {
  it("prerenders the static SPA", () => {
    expect(prerender).toBe(true);
    expect(trailingSlash).toBe("always");
  });
});
