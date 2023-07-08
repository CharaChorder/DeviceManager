import {describe, it, expect} from "vitest"
import {
  chordAsCommandCompatible,
  chordFromCommandCompatible,
  chordsFromFile,
  chordsToFile,
  deserializeActions,
  serializeActions,
} from "./chord"
import type {Chord} from "./chord"

describe("chords", function () {
  describe("actions", function () {
    it("should serialize actions", function () {
      expect(serializeActions([32, 51]).toString(16)).toEqual(0xcc200000000000000000000000000n.toString(16))
    })

    it("should deserialize actions", function () {
      expect(deserializeActions(0xcc200000000000000000000000000n)).toEqual([32, 51])
    })

    for (let i = 0; i < 12; i++) {
      it(`should serialize back-forth ${i} actions`, function () {
        const actions = Array.from({length: i}).map((_, i) => i + 1)
        expect(deserializeActions(serializeActions(actions))).toEqual(actions)
      })
    }
  })

  describe("commands", function () {
    it("should convert to a command", function () {
      expect(chordAsCommandCompatible({actions: [32, 51], phrase: [0x01, 0x68, 0x72, 0xd4, 0x65]})).toEqual(
        "000CC200000000000000000000000000 016872D465",
      )
    })

    it("should parse a command", function () {
      expect(chordFromCommandCompatible("000CC200000000000000000000000000 016872D465")).toEqual({
        actions: [32, 51],
        phrase: [0x01, 0x68, 0x72, 0xd4, 0x65],
      })
    })
  })

  describe("chl file format", function () {
    const fileData: Chord[] = [
      {phrase: [1, 2, 3, 4], actions: [5, 6, 7, 8, 9]},
      {phrase: [10, 11], actions: [12, 13, 14, 15]},
      {phrase: [16], actions: [17]},
    ]

    it("should should convert back-forth a file", function () {
      expect(chordsFromFile(chordsToFile(fileData))).toEqual(fileData)
    })
  })
})
