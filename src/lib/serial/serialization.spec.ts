import { describe, expect, it } from "vitest";
import {
  getSharableUrl,
  parseCompressed,
  parseSharableUrl,
  stringifyCompressed,
} from "./serialization";

describe("compressed serialization", () => {
  it("should round-trip an object through gzip", async () => {
    const data = {
      chords: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      name: "test",
    };
    expect(await parseCompressed(await stringifyCompressed(data))).toEqual(
      data,
    );
  });

  it("should round-trip unicode through gzip", async () => {
    const data = { text: "ÄÖÜ日本語🎹" };
    expect(await parseCompressed(await stringifyCompressed(data))).toEqual(
      data,
    );
  });

  it("should produce a real gzip stream", async () => {
    const blob = await stringifyCompressed({ a: 1 });
    const raw = new Uint8Array(await blob.arrayBuffer());
    // gzip magic number
    expect(raw[0]).toBe(0x1f);
    expect(raw[1]).toBe(0x8b);
  });
});

describe("shareable urls", () => {
  it("should round-trip data through the url", async () => {
    const data = { layout: [[1, 2, 3]], device: "ONE" };
    const url = await getSharableUrl("data", data, "https://example.com/cos/");
    expect(url.searchParams.has("data")).toBe(true);
    expect(await parseSharableUrl("data", url.href)).toEqual(data);
  });

  it("should return undefined for a missing param", async () => {
    expect(
      await parseSharableUrl("nope", "https://example.com/cos/?other=1"),
    ).toBeUndefined();
  });

  it("should keep the base url intact", async () => {
    const url = await getSharableUrl(
      "x",
      [1, 2],
      "https://example.com/cos/?existing=keep",
    );
    expect(url.pathname).toBe("/cos/");
    expect(url.searchParams.get("existing")).toBe("keep");
    expect(url.searchParams.has("x")).toBe(true);
  });
});
