import { describe, expect, it, vi } from "vitest";
import { charaFileFromUriComponent } from "$lib/share/share-url";
import { themeBase, themeColor, themeSuccessBase } from "$lib/style/theme";
import { load } from "./+layout";

vi.mock("$lib/share/share-url", () => ({
  charaFileFromUriComponent: vi.fn(async () => ({
    type: "chords",
    charaVersion: 1,
    chords: [],
  })),
}));

describe("(app) layout load", () => {
  it("provides the theme colors", async () => {
    const data = await load({
      url: new URL("https://dotio.test/config/"),
      data: {},
      fetch: vi.fn(),
      // minimal PageLoad event fields the load function touches
    } as never);

    expect(data).toMatchObject({ themeBase, themeColor, themeSuccessBase });
    expect(data.importFile).toBeUndefined();
  });

  it("decodes an ?import= query into a chara file", async () => {
    const fetch = vi.fn();
    const data = await load({
      url: new URL("https://dotio.test/?import=chords-1-Zm9v"),
      data: {},
      fetch,
    } as never);

    expect(charaFileFromUriComponent).toHaveBeenCalledWith(
      "chords-1-Zm9v",
      fetch,
    );
    expect(data.importFile).toMatchObject({ type: "chords", charaVersion: 1 });
  });
});
