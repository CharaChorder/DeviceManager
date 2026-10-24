import { expect, it } from "vitest";
import legacyChords from "./legacy-chords.sample.csv?raw";
import { csvChordsToJson, isCsvChords } from "./legacy-chords";

it("detects legacy chords csv", () => {
  expect(isCsvChords(legacyChords)).toBe(true);
});

it("converts legacy chords csv", () => {
  const converted = csvChordsToJson(legacyChords);
  expect(converted.charaVersion).toBe(1);
  expect(converted.type).toBe("chords");
  expect(converted.chords).toHaveLength(legacyChords.trim().split("\n").length);
  // "e + b + a,babe"
  expect(converted.chords[0]).toEqual([
    [97, 98, 101],
    [98, 97, 98, 101],
  ]);
  // "i + d + ',I'd"
  expect(converted.chords[4]).toEqual([
    [39, 100, 105],
    [73, 39, 100],
  ]);
});

it("resolves every key in the sample to a real action", () => {
  for (const [input, output] of csvChordsToJson(legacyChords).chords) {
    expect(input).not.toContain(0);
    expect(output).not.toContain(0);
  }
});
