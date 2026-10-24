import { describe, expect, it } from "vitest";
import { LineBreakTransformer } from "./line-break-transformer";

async function transform(chunks: string[]): Promise<string[]> {
  const lines: string[] = [];
  const stream = new ReadableStream<string>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  })
    .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .getReader();

  for (;;) {
    const { value, done } = await stream.read();
    if (done) break;
    lines.push(value);
  }
  return lines;
}

describe("LineBreakTransformer", () => {
  it("should pass complete lines through", async () => {
    expect(await transform(["VERSION 1.1.4\r\n"])).toEqual(["VERSION 1.1.4"]);
  });

  it("should join lines split across chunks", async () => {
    expect(await transform(["CML C0 1", "2\r\n"])).toEqual(["CML C0 12"]);
  });

  it("should split multiple lines from one chunk", async () => {
    expect(await transform(["A\r\nB\r\nC\r\n"])).toEqual(["A", "B", "C"]);
  });

  it("should not emit an unterminated line before flush", async () => {
    expect(await transform(["partial"])).toEqual(["partial"]); // emitted on flush
  });

  it("should keep empty lines", async () => {
    expect(await transform(["a\r\n\r\nb\r\n"])).toEqual(["a", "", "b"]);
  });

  it("should not split a lone CR", async () => {
    expect(await transform(["a\rb\r\n"])).toEqual(["a\rb"]);
  });
});
