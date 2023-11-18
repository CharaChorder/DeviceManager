/**
 * @internal
 */
export class LineBreakTransformer {
  _chunks = "";

  /**
   * @param chunk {string}
   * @param controller {TransformStreamDefaultController}
   */
  transform(chunk, controller) {
    this.chunks += chunk;
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    for (const line of lines) {
      controller.enqueue(line);
    }
  }

  /**
   * @param controller {TransformStreamDefaultController}
   */
  flush(controller) {
    controller.enqueue(this.chunks);
  }
}
