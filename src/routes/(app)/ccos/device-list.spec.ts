import { afterEach, describe, expect, it, vi } from "vitest";
import { load } from "./+page";

describe("ccos index page load", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists the firmware device directories", async () => {
    const fetch = vi.fn(async (url: string) => {
      expect(url).toBe(`${import.meta.env.VITE_FIRMWARE_URL}/`);
      return { json: async () => [{ name: "one_s1" }, { name: "two_s3" }] };
    });
    vi.stubGlobal("fetch", fetch);

    const data = await load({ fetch } as never);

    expect(data.devices).toEqual([{ name: "one_s1" }, { name: "two_s3" }]);
  });
});
