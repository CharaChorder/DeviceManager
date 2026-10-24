import { describe, expect, it } from "vitest";
import { shuffle, shuffleInPlace } from "./shuffle";

describe("shuffle", () => {
  it("should keep the multiset and the length", () => {
    const source = Array.from({ length: 100 }, (_, i) => i);
    const shuffled = shuffle(source);
    expect(shuffled).toHaveLength(source.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(source);
  });

  it("should not mutate the original in shuffle()", () => {
    const source = [1, 2, 3, 4, 5];
    const copy = [...source];
    shuffle(source);
    expect(source).toEqual(copy);
  });

  it("should shuffle in place", () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffleInPlace(source);
    expect(result).toBeUndefined();
    expect([...source].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("should handle empty and singleton arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([7])).toEqual([7]);
  });
});
