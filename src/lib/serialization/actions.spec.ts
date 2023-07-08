import {describe, it, expect} from "vitest"
import {compressActions, decompressActions} from "./actions"

describe("layout", function () {
  const actions = [1, 5, 2, 1023, 42, 2, 4, 78]

  describe("compression", function () {
    it("should compress back and forth arrays divisible by 4", function () {
      expect(decompressActions(compressActions(actions))).toEqual(actions)
    })

    it("should compress back and forth arrays divisible not divisible by 4", function () {
      expect(decompressActions(compressActions([...actions, 1023, 512, 123]))).toEqual([
        ...actions,
        1023,
        512,
        123,
      ])
      expect(decompressActions(compressActions([...actions, 1023, 512]))).toEqual([...actions, 1023, 512])
      expect(decompressActions(compressActions([...actions, 1023]))).toEqual([...actions, 1023])
    })

    it("should compress alternating 0/1023", function () {
      const array = Array.from({length: 128}).map((_, i) => (i % 2 === 0 ? 0 : 1023))
      expect(decompressActions(compressActions(array))).toEqual(array)
    })
  })
})
