import { describe, expect, it } from "vitest";
import { load } from "./+page";

describe("config index page load", () => {
  it("redirects to the layout configuration page", () => {
    let error: { status?: number; location?: string } | undefined;
    try {
      load();
    } catch (caught) {
      error = caught as { status?: number; location?: string };
    }
    expect(error?.status).toBe(302);
    expect(error?.location).toBe("/config/layout/");
  });
});
