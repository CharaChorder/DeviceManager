import {describe, it, expect} from "vitest"
import {
  deserializeActions,
  parseChordActions,
  parsePhrase,
  serializeActions,
  stringifyChordActions,
  stringifyPhrase,
} from "./chord"

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

  describe("phrase", function () {
    it("should stringify", function () {
      expect(stringifyPhrase([0x01, 0x68, 0x72, 0xd4, 0x65])).toEqual("016872D465")
    })

    it("should parse", function () {
      expect(parsePhrase("016872D465")).toEqual([0x01, 0x68, 0x72, 0xd4, 0x65])
    })
  })

  describe("chord actions", function () {
    it("should stringify", function () {
      expect(stringifyChordActions([32, 51])).toEqual("000CC200000000000000000000000000")
    })

    it("should parse", function () {
      expect(parseChordActions("000CC200000000000000000000000000")).toEqual([32, 51])
    })
  })
})
