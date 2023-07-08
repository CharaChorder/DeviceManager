import {describe, it, expect} from "vitest"
import {serializeActions} from "$lib/serial/chord"

describe("chords", function () {
  it("should serialize actions", function () {
    expect(serializeActions([67, 2])).toBe(0xcc200000000000000000000000000n)
  })
})
