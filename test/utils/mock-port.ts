import { CharaDevice, type SerialPortLike } from "$lib/serial/device";

/**
 * Deterministic in-memory stand-in for a `SerialPort`.
 *
 * Mirrors the Web Serial contract `CharaDevice` relies on:
 * `readable`/`writable` are handed out fresh per access (like a port that
 * is re-opened on wake), text chunks (commands ending in CRLF) are routed
 * to `onCommand`, raw (non-text) chunks are routed to `onBytes`, and
 * `respond()` feeds a line back to the device.
 */
export class MockPort implements SerialPortLike {
  openCount = 0;
  closeCount = 0;
  forgetCount = 0;
  writtenBytes = 0;
  commands: string[] = [];
  onCommand?: (command: string) => void;
  onBytes?: (chunk: Uint8Array) => void;

  #controller!: ReadableStreamDefaultController<Uint8Array>;

  get readable(): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        this.#controller = controller;
      },
    });
  }

  get writable(): WritableStream<Uint8Array> {
    return new WritableStream<Uint8Array>({
      write: (chunk) => {
        this.writtenBytes += chunk.length;
        // commands are printable text, framed by CR/LF (bytes 10/13)
        const printable = [...chunk].every(
          (b) => (b >= 32 && b < 127) || b === 10 || b === 13,
        );
        if (printable) {
          const text = new TextDecoder().decode(chunk);
          const command = text.replace(/\r\n$/, "");
          this.commands.push(command);
          this.onCommand?.(command);
        } else {
          this.onBytes?.(chunk);
        }
      },
    });
  }

  respond(line: string) {
    this.#controller.enqueue(new TextEncoder().encode(`${line}\r\n`));
  }

  async open(_options: SerialOptions) {
    this.openCount++;
  }
  async close() {
    this.closeCount++;
  }
  async forget() {
    this.forgetCount++;
  }
  getInfo(): SerialPortInfo {
    return { usbProductId: 0x8253, usbVendorId: 0x303a };
  }
}

export const HANDSHAKE: Record<string, string> = {
  VERSION: "VERSION 3.1.0-beta.3",
  ID: "ID CHARACHORDER ZERO WASM",
};

/**
 * Reply to each received command from a fixed lookup table.
 */
export function responder(port: MockPort, handlers: Record<string, string>) {
  port.onCommand = (command) => {
    const reply = handlers[command];
    if (reply !== undefined) port.respond(reply);
  };
}

export function deviceFor(
  handlers: Record<string, string> = HANDSHAKE,
): [CharaDevice, MockPort] {
  const port = new MockPort();
  responder(port, handlers);
  return [new CharaDevice(port), port];
}
