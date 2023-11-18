import {describe, it, expect} from "vitest"
import {fromBase64, toBase64} from "./base64"

describe("base64", function () {
  const data = new Uint8Array([24, 235, 22, 67, 84, 73, 23, 77, 21])

  it("should convert back-forth", async function () {
    expect(await fromBase64(await toBase64(new Blob([data]))).then(it => it.arrayBuffer())).toEqual(
      data.buffer,
    )
  })
})
