// Unit-project setup:
// - jsdom's Blob lacks .stream()/.arrayBuffer(): back them with jsdom's
//   FileReader, which can read jsdom Blobs.
// - Node's Response.blob() yields a node:buffer Blob, which jsdom's
//   FileReader rejects: convert those blobs before handing them over.
if (typeof Blob !== "undefined" && !Blob.prototype.arrayBuffer) {
  const readBlob = (blob: Blob, mode: "buffer" | "text"): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      if (mode === "buffer") reader.readAsArrayBuffer(blob);
      else reader.readAsText(blob);
    });

  Blob.prototype.arrayBuffer = function (this: Blob) {
    return readBlob(this, "buffer");
  } as typeof Blob.prototype.arrayBuffer;
  Blob.prototype.text = function (this: Blob) {
    return readBlob(this, "text");
  } as typeof Blob.prototype.text;
}

if (typeof Blob !== "undefined" && !Blob.prototype.stream) {
  Blob.prototype.stream = function (this: Blob): ReadableStream<Uint8Array> {
    const blob = this;
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new Uint8Array(await blob.arrayBuffer()));
        controller.close();
      },
    });
  } as typeof Blob.prototype.stream;
}

if (typeof FileReader !== "undefined") {
  const isNodeBlob = (value: any): boolean =>
    !(value instanceof Blob) &&
    typeof value?.arrayBuffer === "function" &&
    typeof value?.size === "number" &&
    typeof value?.type === "string";

  for (const method of [
    "readAsDataURL",
    "readAsArrayBuffer",
    "readAsText",
  ] as const) {
    const original = FileReader.prototype[method];
    FileReader.prototype[method] = function (this: FileReader, blob: Blob) {
      if (isNodeBlob(blob)) {
        const nodeBlob = blob as globalThis.Blob;
        nodeBlob
          .arrayBuffer()
          .then((buffer) => {
            original.call(
              this,
              new Blob([new Uint8Array(buffer)], { type: nodeBlob.type }),
            );
          })
          .catch((error) => {
            console.error(error);
            this.dispatchEvent(new Event("error"));
          });
        return;
      }
      original.call(this, blob);
    };
  }
}

export {};
