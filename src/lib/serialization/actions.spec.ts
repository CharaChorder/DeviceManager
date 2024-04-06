import { describe, it, expect } from "vitest";
import { compressActions, decompressActions } from "./actions";

describe("layout", function () {
  const actions = [1023, 255, 256, 42, 32, 532, 8000];

  describe("compression", function () {
    it("should compress back and forth arrays divisible by 4", function () {
      expect(decompressActions(compressActions(actions))).toEqual(actions);
    });
  });
});
