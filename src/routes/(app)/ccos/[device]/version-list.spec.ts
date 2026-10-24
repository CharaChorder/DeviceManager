import { afterEach, describe, expect, it, vi } from "vitest";
import { load } from "./+page";

describe("device page load", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists versions sorted newest-first", async () => {
    const fetch = vi.fn(async (url: string) => {
      expect(url).toBe(`${import.meta.env.VITE_FIRMWARE_URL}/two_s3/`);
      return {
        json: async () => [
          { name: "2.0.0" },
          { name: "1.9.0" },
          { name: "10.0.0" },
        ],
      };
    });
    vi.stubGlobal("fetch", fetch);

    const data = await load({ fetch, params: { device: "two_s3" } } as never);

    expect(data.versions.map((it) => it.name)).toEqual([
      "10.0.0",
      "2.0.0",
      "1.9.0",
    ]);
    expect(data.device).toBe("two_s3");
  });
});
