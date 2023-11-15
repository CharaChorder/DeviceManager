import {describe, it, expect} from "vitest"
import {deserializeActionArray, serializeActionArray} from "./action-array"

describe("action array", () => {
  it("should work with number arrays", () => {
    expect(deserializeActionArray(serializeActionArray([62, 256, 1235]))).toEqual([62, 256, 1235])
  })

  it("should work with nested arrays", () => {
    expect(deserializeActionArray(serializeActionArray([[], [[]]]))).toEqual([[], [[]]])
  })

  it("should compress back and forth", () => {
    expect(
      deserializeActionArray(
        serializeActionArray([
          [43, 746, 634],
          [34, 63],
          [332, 34],
        ]),
      ),
    ).toEqual([
      [43, 746, 634],
      [34, 63],
      [332, 34],
    ])
  })

  it("should compress a full layout", () => {
    const layout = Object.freeze([
      Object.freeze([
        0, 0, 0, 0, 0, 53, 119, 45, 103, 122, 52, 107, 118, 109, 99, 51, 114, 36, 59, 101, 50, 105, 34, 46,
        111, 49, 39, 515, 44, 117, 0, 512, 514, 513, 550, 0, 319, 318, 321, 320, 326, 315, 314, 317, 316, 0,
        0, 0, 0, 0, 54, 98, 120, 536, 113, 55, 102, 112, 104, 100, 56, 97, 296, 544, 116, 57, 108, 299, 106,
        110, 48, 121, 297, 61, 115, 0, 518, 516, 517, 553, 0, 336, 338, 335, 337, 0, 325, 322, 323, 324,
      ]),
      Object.freeze([
        0, 0, 0, 0, 0, 0, 91, 0, 0, 0, 0, 53, 0, 47, 52, 0, 51, 298, 0, 50, 0, 0, 127, 0, 49, 0, 0, 515, 0, 0,
        0, 512, 514, 513, 550, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 93, 0, 536, 0, 0, 54, 0, 92,
        55, 0, 56, 296, 544, 57, 0, 96, 299, 0, 48, 0, 0, 297, 0, 0, 0, 518, 516, 517, 553, 0, 336, 338, 335,
        337, 0, 0, 0, 0, 0,
      ]),
      Object.freeze([
        0, 0, 0, 0, 0, 0, 64, 95, 43, 0, 0, 126, 38, 63, 40, 0, 35, 298, 36, 123, 0, 33, 127, 37, 60, 0, 34,
        515, 0, 0, 0, 512, 514, 513, 550, 0, 333, 331, 330, 334, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 536,
        0, 0, 94, 58, 124, 41, 0, 42, 296, 544, 125, 0, 126, 299, 0, 62, 0, 0, 297, 0, 0, 0, 518, 516, 517,
        553, 0, 336, 338, 335, 337, 0, 0, 0, 0, 0,
      ]),
    ])

    expect(deserializeActionArray(serializeActionArray(layout as number[][]))).toEqual(layout)
  })
})
