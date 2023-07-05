// @ts-check
export class LineBreakTransformer {
  constructor() {
    this.chunks = ""
  }

  // noinspection JSUnusedGlobalSymbols
  transform(chunk, controller) {
    this.chunks += chunk
    const lines = this.chunks.split("\r\n")
    this.chunks = lines.pop()
    for (const line of lines) {
      controller.enqueue(line)
    }
  }

  // noinspection JSUnusedGlobalSymbols
  flush(controller) {
    controller.enqueue(this.chunks)
  }
}
