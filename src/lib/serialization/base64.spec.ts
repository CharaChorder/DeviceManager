import { describe, expect, it } from "vitest";
import { fromBase64, toBase64 } from "./base64";

describe("base64", function () {
  const data = new Uint8Array([24, 235, 22, 67, 84, 73, 23, 77, 21]);

  it("should convert back-forth", async function () {
    expect(
      await fromBase64(await toBase64(new Blob([data]))).then((it) =>
        it.arrayBuffer(),
      ),
    ).toEqual(data.buffer);
  });

  it("should produce url-safe output", async function () {
    // every byte value, so +, / and = padding all occur in normal base64
    const bytes = new Uint8Array(Array.from({ length: 256 }, (_, i) => i));
    const encoded = await toBase64(new Blob([bytes]));
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    expect(
      await fromBase64(encoded)
        .then((it) => it.arrayBuffer())
        .then((it) => new Uint8Array(it)),
    ).toEqual(bytes);
  });

  it("should round-trip an empty blob", async function () {
    expect(
      await fromBase64(await toBase64(new Blob([]))).then((it) => it.size),
    ).toBe(0);
  });
});
