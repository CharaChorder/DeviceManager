export class LineBreakTransformer {
  private chunks = "";

  // noinspection JSUnusedGlobalSymbols
  transform(chunk: string, controller: TransformStreamDefaultController) {
    this.chunks += chunk;
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop()!;
    for (const line of lines) {
      controller.enqueue(line);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  flush(controller: TransformStreamDefaultController) {
    controller.enqueue(this.chunks);
  }
}
