import { getMeta } from "$lib/meta/meta-storage";
import type { SerialPortLike } from "$lib/serial/device";
import type {
  CCOSInitEvent,
  CCOSKeyPressEvent,
  CCOSKeyReleaseEvent,
  CCOSOutEvent,
} from "./ccos-events";
import { KEYCODE_TO_SCANCODE, SCANCODE_TO_KEYCODE } from "./ccos-interop";

const device = "zero_wasm";

export class CCOSKeyboardEvent extends KeyboardEvent {
  constructor(...params: ConstructorParameters<typeof KeyboardEvent>) {
    super(...params);
  }
}

const MASK_CTRL = 0b0001_0001;
const MASK_SHIFT = 0b0010_0010;
const MASK_ALT = 0b0100_0100;
const MASK_ALT_GRAPH = 0b0000_0100;
const MASK_GUI = 0b1000_1000;

export class CCOS implements SerialPortLike {
  private readonly currKeys = new Set<number>();

  private readonly layout = new Map<string, string>([
    ...Array.from(
      { length: 26 },
      (_, i) =>
        [
          JSON.stringify([`Key${String.fromCharCode(65 + i)}`, "Shift"]),
          String.fromCharCode(65 + i),
        ] as const,
    ),
    ...Array.from(
      { length: 10 },
      (_, i) => [JSON.stringify([`Key${i}`]), i.toString()] as const,
    ),

    [JSON.stringify(["Space"]), " "],
    [JSON.stringify(["Backquote"]), "`"],
    [JSON.stringify(["Minus"]), "-"],
    [JSON.stringify(["Comma"]), ","],
    [JSON.stringify(["Period"]), "."],
    [JSON.stringify(["Semicolon"]), ";"],
    [JSON.stringify(["Equal"]), "="],

    [JSON.stringify(["Backquote", "Shift"]), "~"],
    [JSON.stringify(["Minus", "Shift"]), "_"],
    [JSON.stringify(["Comma", "Shift"]), "<"],
    [JSON.stringify(["Period", "Shift"]), ">"],
    [JSON.stringify(["Semicolon", "Shift"]), ":"],
    [JSON.stringify(["Equal", "Shift"]), "+"],

    [JSON.stringify(["Digit0", "Shift"]), ")"],
    [JSON.stringify(["Digit1", "Shift"]), "!"],
    [JSON.stringify(["Digit2", "Shift"]), "@"],
    [JSON.stringify(["Digit3", "Shift"]), "#"],
    [JSON.stringify(["Digit4", "Shift"]), "$"],
    [JSON.stringify(["Digit5", "Shift"]), "%"],
    [JSON.stringify(["Digit6", "Shift"]), "^"],
    [JSON.stringify(["Digit7", "Shift"]), "&"],
    [JSON.stringify(["Digit8", "Shift"]), "*"],
    [JSON.stringify(["Digit9", "Shift"]), "("],
  ]);

  private readonly worker = new Worker("/ccos-worker.js", { type: "module" });

  private resolveReady!: () => void;
  private ready = new Promise<void>((resolve) => {
    this.resolveReady = resolve;
  });

  private lastEvent?: KeyboardEvent;

  private onKey(
    type: ConstructorParameters<typeof KeyboardEvent>[0],
    modifiers: number,
    scanCode: number,
  ) {
    if (!this.lastEvent) {
      return;
    }

    const code = SCANCODE_TO_KEYCODE.get(scanCode);
    if (code === undefined) {
      return;
    }

    const layoutKey = [code];
    if (modifiers & MASK_SHIFT) {
      layoutKey.push("Shift");
    }
    if (modifiers & MASK_ALT_GRAPH) {
      layoutKey.push("AltGraph");
    }
    const key = this.layout.get(JSON.stringify(layoutKey)) ?? code;

    const params: Required<KeyboardEventInit> = {
      bubbles: true,
      cancelable: true,
      location: this.lastEvent.location,
      repeat: this.lastEvent.repeat,
      detail: this.lastEvent.detail,
      view: this.lastEvent.view,
      isComposing: this.lastEvent.isComposing,
      which: this.lastEvent.which,
      composed: this.lastEvent.composed,
      key,
      code,
      charCode: key.charCodeAt(0),
      keyCode: this.lastEvent.keyCode,
      shiftKey: (modifiers & MASK_SHIFT) !== 0,
      ctrlKey: (modifiers & MASK_CTRL) !== 0,
      metaKey: (modifiers & MASK_GUI) !== 0,
      altKey: (modifiers & MASK_ALT) !== 0,
      modifierAltGraph: (modifiers & MASK_ALT_GRAPH) !== 0,
      modifierCapsLock: this.lastEvent.getModifierState("CapsLock"),
      modifierFn: this.lastEvent.getModifierState("Fn"),
      modifierFnLock: this.lastEvent.getModifierState("FnLock"),
      modifierHyper: this.lastEvent.getModifierState("Hyper"),
      modifierNumLock: this.lastEvent.getModifierState("NumLock"),
      modifierSuper: (modifiers & MASK_GUI) !== 0,
      modifierSymbol: this.lastEvent.getModifierState("Symbol"),
      modifierSymbolLock: this.lastEvent.getModifierState("SymbolLock"),
      modifierScrollLock: this.lastEvent.getModifierState("ScrollLock"),
    };

    this.lastEvent.target?.dispatchEvent(new CCOSKeyboardEvent(type, params));
  }

  private onReport(modifiers: number, keys: number[]) {
    const nextKeys = new Set<number>(keys);
    nextKeys.delete(0);
    for (const key of this.currKeys) {
      if (!nextKeys.has(key)) {
        this.onKey("keyup", modifiers, key);
      }
    }
    for (const key of nextKeys) {
      if (!this.currKeys.has(key)) {
        this.onKey("keydown", modifiers, key);
      }
    }
    this.currKeys.clear();
    for (const key of keys) {
      this.currKeys.add(key);
    }
    this.currKeys.delete(0);
  }

  private controller?: ReadableStreamDefaultController<Uint8Array>;

  readable!: ReadableStream<Uint8Array>;
  writable!: WritableStream<Uint8Array>;

  constructor(url: string) {
    this.worker.addEventListener(
      "message",
      (event: MessageEvent<CCOSOutEvent>) => {
        if (event.data instanceof Uint8Array) {
          this.controller?.enqueue(event.data);
          return;
        }
        switch (event.data.type) {
          case "ready": {
            this.resolveReady();
            break;
          }
          case "report": {
            this.onReport(event.data.modifiers, event.data.keys);
            break;
          }
        }
      },
    );
    (navigator as any).keyboard
      ?.getLayoutMap()
      ?.then((it: Map<string, string>) =>
        it.entries().forEach(([key, value]) => {
          this.layout.set(JSON.stringify([key]), value);
        }),
      );
    this.worker.postMessage({
      type: "init",
      url,
    } satisfies CCOSInitEvent);
  }

  getInfo(): SerialPortInfo {
    return {};
  }

  async open(_options: SerialOptions) {
    this.readable = new ReadableStream<Uint8Array>({
      start: (controller) => {
        this.controller = controller;
      },
    });
    this.writable = new WritableStream<Uint8Array>({
      write: (chunk) => {
        this.worker.postMessage(chunk, [chunk.buffer]);
      },
    });
    return this.ready;
  }
  async close() {
    await this.ready;
  }
  async forget() {
    await this.ready;
    this.close();
    this.worker.terminate();
  }

  async handleKeyEvent(event: KeyboardEvent) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      console.error("CCOS does not support input elements");
      return;
    }

    if (!this.ready || event instanceof CCOSKeyboardEvent) {
      return;
    }
    event.stopImmediatePropagation();
    event.preventDefault();
    this.lastEvent = event;

    const layoutKey = [event.code];
    if (event.getModifierState("Shift")) {
      layoutKey.push("Shift");
    }
    if (event.getModifierState("AltGraph")) {
      layoutKey.push("AltGraph");
    }
    this.layout.set(JSON.stringify(layoutKey), event.key);

    const scanCode = KEYCODE_TO_SCANCODE.get(event.code);
    if (scanCode === undefined) return;
    if (event.type === "keydown") {
      this.worker.postMessage({
        type: "press",
        code: scanCode,
      } satisfies CCOSKeyPressEvent);
    } else {
      this.worker.postMessage({
        type: "release",
        code: scanCode,
      } satisfies CCOSKeyReleaseEvent);
    }
  }
}

export async function fetchCCOS(
  version = "3.0.0-rc.0",
  fetch: typeof window.fetch = window.fetch,
): Promise<CCOS | undefined> {
  const meta = await getMeta(device, version, fetch);
  if (!meta?.update.js || !meta?.update.wasm) {
    return undefined;
  }

  return new CCOS(`${meta.path}/${meta.update.js}`);
}
