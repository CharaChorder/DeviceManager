import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMeta } from "$lib/meta/meta-storage";

/**
 * `meta-storage` unit tests.
 *
 * jsdom has no IndexedDB, so `getMeta` always falls through to its
 * `fetchMeta` path; a scripted fetch lets us assert the full manifest
 * mapping without network access.
 */

const BASE = "https://meta.test/firmware";

type Json = Record<string, unknown> | unknown[];

function jsonFetch(files: Record<string, Json>) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const key = String(url);
    calls.push(key);
    const body = files[key];
    if (body === undefined) {
      return new Response("not found", { status: 404 });
    }
    return Response.json(body);
  }) as unknown as typeof window.fetch;
  return { fetchMock, calls };
}

beforeEach(() => {
  vi.stubEnv("VITE_FIRMWARE_URL", BASE);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getMeta", () => {
  it("maps a full zero_wasm manifest", async () => {
    const path = `${BASE}/zero_wasm/3.1.0-beta.3`;
    const { fetchMock } = jsonFetch({
      [`${path}/`]: [{ type: "file", name: "meta.json" }],
      [`${path}/meta.json`]: {
        target: "zero_wasm",
        version: "3.1.0-beta.3",
        git_commit: "1e28ccd",
        git_is_dirty: true,
        git_date: "2026-04-28T16:27:12+02:00",
        public_build: true,
        development_mode: 0,
        factory_defaults: {
          layout: "factory_layout.json",
          settings: "factory_settings.json",
          chords: { starter: "starter_chords.json" },
        },
        settings: "settings.json",
        changelog: "changelog.json",
        actions: "actions.json",
        recipes: "recipes.json",
        update: { js: "ccos.js", wasm: "ccos.wasm" },
      },
      [`${path}/factory_layout.json`]: [{ key: "layout" }],
      [`${path}/factory_settings.json`]: [{ key: "settings" }],
      [`${path}/starter_chords.json`]: { type: "chords", chords: [] },
      [`${path}/settings.json`]: [{ name: "keyboard", items: [] }],
      [`${path}/changelog.json`]: [{ version: "3.1.0-beta.3" }],
      [`${path}/actions.json`]: [{ name: "letters", cmd: "key" }],
      [`${path}/recipes.json`]: [{ name: "recipe" }],
    });

    const meta = await getMeta("zero_wasm", "3.1.0-beta.3", fetchMock);

    expect(meta.version).toBe("3.1.0-beta.3");
    expect(meta.device).toBe("zero_wasm");
    expect(meta.path).toBe(path);
    expect(meta.commit).toBe("1e28ccd");
    expect(meta.dirty).toBe(true);
    expect(meta.public).toBe(true);
    expect(meta.developmentBuild).toBe(false);
    expect(meta.date.toISOString().startsWith("2026-04-28")).toBe(true);
    expect(meta.update.js).toBe("ccos.js");
    expect(meta.update.wasm).toBe("ccos.wasm");
    expect(meta.update.uf2).toBeUndefined();
    expect(meta.update.ota).toBeUndefined();
    expect(meta.factoryDefaults?.layout).toEqual([{ key: "layout" }]);
    expect(meta.factoryDefaults?.chords?.["starter"]).toEqual({
      type: "chords",
      chords: [],
    });
    expect(meta.settings).toEqual([{ name: "keyboard", items: [] }]);
    expect(meta.changelog).toEqual([{ version: "3.1.0-beta.3" }]);
    expect(meta.actions).toEqual([{ name: "letters", cmd: "key" }]);
    expect(meta.recipes).toEqual([{ name: "recipe" }]);
  });

  it("derives update files from the directory listing", async () => {
    const path = `${BASE}/two_s3/2.1.1`;
    const { fetchMock } = jsonFetch({
      [`${path}/`]: [
        { type: "file", name: "CURRENT.UF2" },
        { type: "file", name: "firmware.bin" },
        { type: "file", name: "meta.json", mtime: "2024-01-02T00:00:00Z" },
      ],
      [`${path}/meta.json`]: {
        target: "two_s3",
        version: "2.1.1",
      },
      [`${path}/settings.json`]: [],
    });

    const meta = await getMeta("two_s3", "2.1.1", fetchMock);
    expect(meta.update.uf2).toBe("CURRENT.UF2");
    expect(meta.update.ota).toBe("firmware.bin");
    expect(meta.factoryDefaults).toBeUndefined();
    expect(meta.dirty).toBe(false);
    expect(meta.developmentBuild).toBe(false);
  });

  it("falls back to bundled settings for an empty listing", async () => {
    const path = `${BASE}/lite_m0/2.0.0`;
    const { fetchMock } = jsonFetch({
      [`${path}/`]: [],
    });

    const meta = await getMeta("lite_m0", "2.0.0", fetchMock);
    expect(meta.version).toBe("2.0.0");
    expect(meta.device).toBe("lite_m0");
    expect(meta.commit).toBeUndefined();
    expect(meta.public).toBe(true);
    // bundled settings.yml keeps the leds category for lite devices
    expect(meta.settings.length).toBeGreaterThan(0);
    expect(meta.settings.some((it) => it.name === "leds")).toBe(true);
  });

  it("drops the leds category for non-lite devices without meta", async () => {
    const path = `${BASE}/two_s3/1.0.0+custom`;
    const { fetchMock } = jsonFetch({
      [`${path}/`]: [],
    });

    const meta = await getMeta("two_s3", "1.0.0+custom", fetchMock);
    expect(meta.settings.some((it) => it.name === "leds")).toBe(false);
    // "+" in the version marks a private build
    expect(meta.public).toBe(false);
  });

  it("marks development builds", async () => {
    const path = `${BASE}/x/9.9.9`;
    const { fetchMock } = jsonFetch({
      [`${path}/`]: [{ type: "file", name: "meta.json" }],
      [`${path}/meta.json`]: {
        development_mode: 1,
        settings: "settings.json",
      },
      [`${path}/settings.json`]: [],
    });

    const meta = await getMeta("x", "9.9.9", fetchMock);
    expect(meta.developmentBuild).toBe(true);
  });
});
