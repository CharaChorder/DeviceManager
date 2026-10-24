import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMeta } from "$lib/meta/meta-storage";
import { load } from "./+page";
import type { VersionMeta } from "$lib/meta/types/meta";

vi.mock("$lib/meta/meta-storage", () => ({
  getMeta: vi.fn(),
}));

const meta = {
  device: "ZERO",
  version: "2.1.1",
} as unknown as VersionMeta;

describe("version page load", () => {
  beforeEach(() => {
    vi.mocked(getMeta).mockReset();
  });

  it("loads the meta and suggests the previous major version", async () => {
    vi.mocked(getMeta).mockResolvedValue(meta);
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [{ name: "1.9.0" }, { name: "1.10.0-rc.1" }],
    }));

    const data = await load({
      fetch,
      params: { device: "ZERO", version: "2.1.1" },
    } as never);

    expect(getMeta).toHaveBeenCalledWith("ZERO", "2.1.1", fetch);
    expect(data.meta).toBe(meta);
    // major-1 candidates: the stable 1.9.0 wins over the prerelease
    expect(data.previousMajor).toBe("1.9.0");
  });

  it("errors 404 for a version that has no meta", async () => {
    vi.mocked(getMeta).mockResolvedValue(undefined as never);

    let status: number | undefined;
    try {
      await load({
        fetch: vi.fn(),
        params: { device: "ZERO", version: "9.9.9" },
      } as never);
    } catch (error) {
      status = (error as { status?: number }).status;
    }
    expect(status).toBe(404);
  });

  it("degrades to no suggestion when the listing is unavailable", async () => {
    vi.mocked(getMeta).mockResolvedValue(meta);
    const fetch = vi.fn(async () => {
      throw new Error("offline");
    });

    const data = await load({
      fetch,
      params: { device: "ZERO", version: "2.1.1" },
    } as never);

    expect(data.meta).toBe(meta);
    expect(data.previousMajor).toBeUndefined();
  });
});
