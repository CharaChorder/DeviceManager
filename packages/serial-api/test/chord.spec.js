import { describe, it, expect } from "vitest";
import {
  deserializeChordInput,
  parseChordInput,
  parseChordOutput,
  serializeChordInput,
  stringifyChordInput,
  stringifyChordOutput,
} from "../lib/chord";

describe("chords", function () {
  describe("actions", function () {
    it("should serialize actions", function () {
      expect(serializeChordInput([32, 51]).toString(16)).toEqual(
        0xcc200000000000000000000000000n.toString(16),
      );
    });

    it("should deserialize actions", function () {
      expect(deserializeChordInput(0xcc200000000000000000000000000n)).toEqual([
        32, 51,
      ]);
    });

    for (let i = 0; i < 12; i++) {
      it(`should serialize back-forth ${i} actions`, function () {
        const actions = Array.from({ length: i }).map((_, i) => i + 1);
        expect(deserializeChordInput(serializeChordInput(actions))).toEqual(
          actions,
        );
      });
    }
  });

  describe("phrase", function () {
    it("should stringify", function () {
      expect(
        stringifyChordOutput([0x20, 0x68, 0x72, 0xd4, 0x65, 0x1fff]),
      ).toEqual("206872D4651FFF");
    });

    it("should parse", function () {
      expect(parseChordOutput("206872D4651FFF")).toEqual([
        0x20, 0x68, 0x72, 0xd4, 0x65, 0x1fff,
      ]);
    });
  });

  describe("chord actions", function () {
    it("should stringify", function () {
      expect(stringifyChordInput([32, 51])).toEqual(
        "000CC200000000000000000000000000",
      );
    });

    it("should parse", function () {
      expect(parseChordInput("000CC200000000000000000000000000")).toEqual([
        32, 51,
      ]);
    });
  });
});
