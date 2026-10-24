import { describe, expect, it } from "vitest";
import { compressActions, decompressActions } from "./actions";

describe("layout", function () {
  const actions = [1023, 255, 256, 42, 32, 532, 8000];

  describe("compression", function () {
    it("should compress back and forth arrays divisible by 4", function () {
      expect(decompressActions(compressActions(actions))).toEqual(actions);
    });

    it("should compress back and forth the boundaries", function () {
      const boundaries = [32, 255, 256, 1023, 1024, 8191];
      expect(decompressActions(compressActions(boundaries))).toEqual(
        boundaries,
      );
    });

    it("should compress an empty list to an empty buffer", function () {
      expect(compressActions([])).toEqual(new Uint8Array());
      expect(decompressActions(new Uint8Array())).toEqual([]);
    });

    it("should encode values above 255 as two bytes", function () {
      expect(compressActions([256])).toEqual(new Uint8Array([1, 0]));
      expect(compressActions([8191])).toEqual(new Uint8Array([31, 255]));
    });

    it("should encode values up to 255 as a single byte", function () {
      expect(compressActions([255])).toEqual(new Uint8Array([255]));
      expect(compressActions([255, 255])).toEqual(new Uint8Array([255, 255]));
    });

    it("should decode 1..31 lead bytes as the start of a 13-bit integer", function () {
      // 8191 is stored as [31, 255]: the 31 is never a standalone action
      expect(decompressActions(new Uint8Array([31, 255]))).toEqual([8191]);
    });

    it("should round-trip a large varied list", function () {
      // valid action codes only: 0 and 32..8191 (1..31 are protocol-invalid)
      const list = Array.from({ length: 1000 }, (_, i) => {
        const v = (i * 7919) % 8160;
        return v === 0 ? 0 : v + 31;
      });
      expect(decompressActions(compressActions(list))).toEqual(list);
    });
  });
});
