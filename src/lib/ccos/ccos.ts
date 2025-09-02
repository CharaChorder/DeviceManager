import { getMeta } from "$lib/meta/meta-storage";
import { connectable, from, multicast, Subject } from "rxjs";
import type {
  CCOSInitEvent,
  CCOSKeyPressEvent,
  CCOSKeyReleaseEvent,
  CCOSOutEvent,
} from "./ccos-events";
import { KEYCODE_TO_SCANCODE, SCANCODE_TO_KEYCODE } from "./ccos-interop";

const device = ".zero_wasm";

class CCOSKeyboardEvent extends KeyboardEvent {
  constructor(...params: ConstructorParameters<typeof KeyboardEvent>) {
    super(...params);
  }
}

const MASK_CTRL = 0b0001_0001;
const MASK_SHIFT = 0b0010_0010;
const MASK_ALT = 0b0100_0100;
const MASK_ALT_GRAPH = 0b0000_0100;
const MASK_GUI = 0b1000_1000;

export class CCOS {
  private readonly currKeys = new Set<number>();

  private readonly layout = new Map<string, string>();

  private readonly worker = new Worker("/ccos-worker.js", { type: "module" });

  private ready = false;

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

  private outStream = new Subject<number>();

  private readonly buffer: number[] = [];
  private readonly outStream = new WritableStream<number>({
    start(controller) {},
  });

  readonly readable = connectable()
  readonly writable = new WritableStream<string>();

  constructor(url: string) {
    this.worker.addEventListener(
      "message",
      (event: MessageEvent<CCOSOutEvent>) => {
        switch (event.data.type) {
          case "ready": {
            this.ready = true;
            break;
          }
          case "report": {
            this.onReport(event.data.modifiers, event.data.keys);
            break;
          }
          case "serial": {
            this.outStream.next(event.data.data);
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

  async destroy() {
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
  version = ".test",
  fetch: typeof window.fetch = window.fetch,
): Promise<CCOS | undefined> {
  const meta = await getMeta(device, version, fetch);
  if (!meta?.update.js || !meta?.update.wasm) {
    return undefined;
  }

  return new CCOS(`${meta.path}/${meta.update.js}`);
}
