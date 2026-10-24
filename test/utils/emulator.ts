import type { SerialPortLike } from "$lib/serial/device";

/**
 * Harness for the CCOS WebAssembly emulator.
 *
 * The firmware artifacts (`ccos.js` / `ccos.wasm`) are *not* stored in this
 * repository. They are fetched from the official firmware endpoints, exactly
 * like the app does in `src/lib/ccos/ccos.ts`, and booted the same way the
 * app's `static/ccos-worker.js` worker boots them:
 *
 *   https://charachorder.io/firmware/zero_wasm/<version>/meta.json  (manifest)
 *   https://charachorder.io/firmware/zero_wasm/<version>/ccos.js    (emscripten module)
 *   https://charachorder.io/firmware/zero_wasm/<version>/ccos.wasm  (firmware image,
 *     loaded by the module itself, resolved relative to the module's own URL)
 *
 * The emscripten module for `zero_wasm` accepts *no* module options (its
 * INCOMING_MODULE_JS_API is stripped), which is why the worker imports the
 * published URL directly: the module resolves its own `import.meta.url` and
 * fetches the wasm image from the same firmware directory.
 *
 * Set `VITE_EMULATOR_BASE_URL` (see `.env.example`) to serve the artifacts
 * from a local HTTP server for offline runs.
 */

export const DEFAULT_EMULATOR_BASE_URL =
  "https://charachorder.io/firmware/zero_wasm";

/** Firmware version used when the version index cannot be parsed. */
export const FALLBACK_EMULATOR_VERSION = "3.1.0-beta.3";

export function defaultBaseUrl(): string {
  return import.meta.env["VITE_EMULATOR_BASE_URL"] ?? DEFAULT_EMULATOR_BASE_URL;
}

/** Flash root inside the module filesystem, as used by `static/ccos-worker.js`. */
export const CCOS_FS_PATH = "/CCOS";

interface EmscriptenFS {
  mkdir(path: string): unknown;
  readdir(path: string): string[];
}

/**
 * The published module exposes a small runtime surface: the exported
 * functions (raw names, underscore-prefixed aliases), plus `ccall`,
 * `addFunction` and `FS`. Notably *no* `HEAPU8` — all data crosses through
 * callbacks.
 */
export interface EmulatorModule {
  addFunction(fn: (...args: number[]) => void, signature: string): number;
  /** Heap view; injected by the harness (the build exposes no `HEAPU8`). */
  __getHeap(): Uint8Array;
  ccall(
    name: string,
    returnType: string | null,
    argTypes: string[],
    args: unknown[],
    opts?: { async?: boolean },
  ): unknown;
  serialWrite(byte: number): void;
  update(millis: number): void;
  addPressedKey(key: number): void;
  removePressedKey(key: number): void;
  FS: EmscriptenFS;
}

export interface LoadedFirmware {
  version: string;
  /** URL of the emscripten module for this version. */
  jsUrl: string;
  /** Instantiate the module; the wasm image loads itself from the host. */
  createModule(): Promise<EmulatorModule>;
}

/** HID report emitted by the firmware: modifiers plus the pressed keys. */
export interface KeyReport {
  modifiers: number;
  keys: number[];
}

export interface EmulatorHandle {
  /** Bridge handed to `CharaDevice`. */
  port: SerialPortLike;
  version: string;
  /** Key reports emitted by the firmware. */
  reports: KeyReport[];
  /** Advance the firmware scheduler by `stepMs` milliseconds. */
  pump(stepMs?: number): void;
  /** Press a scancode as if it were a chord key. */
  pressKey(scancode: number): void;
  /** Release a previously pressed scancode. */
  releaseKey(scancode: number): void;
  /** Entries of the flash root directory in the module filesystem. */
  flashFiles(): string[];
  dispose(): void;
}

async function fetchMeta(
  version: string,
  baseUrl: string,
): Promise<Record<string, unknown>> {
  const metaUrl = `${baseUrl}/${version}/meta.json`;
  const res = await fetch(metaUrl);
  if (!res.ok) {
    throw new Error(
      `fetching ${metaUrl} failed: ${res.status}. Does version ${version} exist?`,
    );
  }
  return (await res.json()) as Record<string, unknown>;
}

/** Download the firmware manifest for one version from the firmware host. */
export async function loadFirmware(
  version: string,
  baseUrl: string = defaultBaseUrl(),
): Promise<LoadedFirmware> {
  const meta = await fetchMeta(version, baseUrl);
  const update = meta["update"] as { js?: string; wasm?: string } | undefined;
  const jsName = update?.js ?? "ccos.js";
  const wasmName = update?.wasm ?? "ccos.wasm";

  const jsUrl = `${baseUrl}/${version}/${jsName}`;
  const wasmUrl = `${baseUrl}/${version}/${wasmName}`;
  return {
    version,
    jsUrl,
    async createModule() {
      // The published module is imported as a blob so the harness can
      // attach a heap accessor (the build exposes no `HEAPU8`). Its two
      // `import.meta.url` uses — the script URL and the `findWasmBinary()`
      // fallback — are pinned to the firmware directory URLs, so the
      // module fetches its own wasm image from the host, exactly like the
      // app's worker does when importing the URL directly.
      const res = await fetch(jsUrl);
      if (!res.ok) {
        throw new Error(`fetching ${jsUrl} failed: ${res.status}`);
      }
      const source = (await res.text())
        .replace(
          "var _scriptName = import.meta.url;",
          `var _scriptName = ${JSON.stringify(jsUrl)};`,
        )
        .replace(
          "return new URL('ccos.wasm', import.meta.url).href;",
          `return ${JSON.stringify(wasmUrl)};`,
        )
        .replace(
          "var Module = moduleArg;",
          "var Module = moduleArg;\n  Module.__getHeap = () => new Uint8Array(wasmMemory.buffer);",
        );
      const moduleUrl = URL.createObjectURL(
        new Blob([source], { type: "text/javascript" }),
      );
      try {
        const mod = (await import(/* @vite-ignore */ moduleUrl)) as {
          default: () => Promise<EmulatorModule>;
        };
        return mod.default();
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    },
  };
}

/**
 * Boot one emulator instance and bridge it to a `SerialPortLike` suitable
 * for `CharaDevice`. The boot sequence mirrors `static/ccos-worker.js`:
 * instantiate, `mkdir` the flash root, register the serial/key-report
 * callbacks, then `init(path, onReport, onSerial)` asynchronously.
 */
export async function createEmulator(
  firmware: LoadedFirmware,
  options: { logWire?: boolean } = {},
): Promise<EmulatorHandle> {
  const mod = await firmware.createModule();
  mod.FS.mkdir(CCOS_FS_PATH);

  const outgoing: number[] = [];
  let consumer: ReadableStreamDefaultController<Uint8Array> | null = null;

  const drain = () => {
    if (!consumer) return;
    while (outgoing.length > 0) {
      consumer.enqueue(new Uint8Array([outgoing.shift()!]));
    }
  };

  const onSerial = mod.addFunction((byte: number) => {
    outgoing.push(byte & 0xff);
    if (options.logWire) console.debug("[emulator→app]", byte & 0xff);
    drain();
  }, "vi");

  const reports: KeyReport[] = [];
  // `MaxKeyReport = KeyReport<18>` is a 20-byte packed struct
  // (modifiers, reserved, keys[18]); by-value struct args larger than
  // 8 bytes cross the wasm boundary as a pointer.
  const onReport = mod.addFunction((ptr: number) => {
    const heap = mod.__getHeap();
    const report: KeyReport = {
      modifiers: heap[ptr] ?? 0,
      keys: [...heap.slice(ptr + 2, ptr + 20)].filter(
        (key): key is number => key !== undefined && key !== 0,
      ),
    };
    reports.push(report);
    if (options.logWire) console.debug("[emulator key report]", report);
  }, "vi");

  await mod.ccall(
    "init",
    "void",
    ["string", "number", "number"],
    [CCOS_FS_PATH, onReport, onSerial],
    { async: true },
  );

  let opened = false;
  const port: SerialPortLike = {
    // Fresh streams per access, mirroring how the Web Serial API hands out
    // streams after each `open()`/`wake()` cycle.
    get readable() {
      return new ReadableStream<Uint8Array>({
        start(controller) {
          consumer = controller;
          drain();
        },
      });
    },
    get writable() {
      return new WritableStream<Uint8Array>({
        write(chunk) {
          if (!opened) throw new Error("port is closed");
          for (const byte of chunk) {
            if (options.logWire) console.debug("[app→emulator]", byte);
            mod.serialWrite(byte);
          }
        },
      });
    },
    async open() {
      opened = true;
    },
    async close() {
      opened = false;
    },
    getInfo() {
      return { usbProductId: 0x8253, usbVendorId: 0x303a };
    },
    async forget() {
      /** the emulator is never paired with the browser */
    },
  };

  let millis = 0;
  const pump = (stepMs = 2) => {
    millis += stepMs;
    mod.update(millis);
  };

  return {
    port,
    version: firmware.version,
    reports,
    pump,
    pressKey(scancode: number) {
      mod.addPressedKey(scancode);
      pump();
    },
    releaseKey(scancode: number) {
      mod.removePressedKey(scancode);
      pump();
    },
    flashFiles() {
      return mod.FS.readdir(CCOS_FS_PATH).filter(
        (n) => n !== "." && n !== "..",
      );
    },
    dispose() {
      // The published module does not expose `removeFunction`; dropping
      // the handle releases the whole instance.
    },
  };
}

export async function listVersions(
  baseUrl: string = defaultBaseUrl(),
): Promise<string[]> {
  const res = await fetch(`${baseUrl}/`);
  if (!res.ok) throw new Error(`firmware index request failed: ${res.status}`);
  const text = await res.text();
  const versions = text.match(/\d+\.\d+\.\d+(?:-[\w.]+)?/g) ?? [];
  return [...new Set(versions)];
}

export async function getLatestVersion(
  baseUrl: string = defaultBaseUrl(),
): Promise<string> {
  const versions = await listVersions(baseUrl);
  if (versions.length === 0) throw new Error("firmware index is empty");
  return versions[versions.length - 1]!;
}
