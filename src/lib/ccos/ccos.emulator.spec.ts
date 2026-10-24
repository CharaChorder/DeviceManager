import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CCOS, CCOSKeyboardEvent, fetchCCOS } from "$lib/ccos/ccos";
import { CharaDevice } from "$lib/serial/device";

/**
 * End-to-end tests of the app's CCOS mode: `fetchCCOS` resolves the
 * firmware from the official meta API, the class boots the published
 * module worker (`/ccos-worker.js`, served from `static/`), and
 * `CharaDevice` talks to the real wasm firmware over the worker bridge.
 *
 * Uses the firmware version the app boots by default (3.0.0-rc.0).
 * This is part of the opt-in lane: `pnpm test:emulator`.
 */

const VERSION = "3.0.0-rc.0";

let ccos: CCOS | undefined;
let device: CharaDevice;

beforeAll(async () => {
  vi.stubEnv("VITE_FIRMWARE_URL", "https://charachorder.io/firmware");
  ccos = await fetchCCOS(VERSION);
  expect(ccos).toBeDefined();
  device = new CharaDevice(ccos!);
  await device.init();
}, 180_000);

afterAll(async () => {
  await ccos?.forget();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("CCOS worker bridge", () => {
  it("handshakes with the firmware through the worker", () => {
    expect(device.version).toBe(VERSION);
    expect(device.company).toBe("CHARACHORDER");
    expect(device.device).toBe("ZERO");
    expect(device.keyCount).toBe(256);
    expect(device.profileCount).toBe(3);
    expect(device.layerCount).toBe(4);
  }, 30_000);

  it("performs chord CRUD over the bridge", async () => {
    const actions = [0x130, 0x131];
    const phrase = [0x20, 0x71];

    const base = await device.getChordCount();

    await device.setChord({ actions, phrase });
    expect(await device.getChordCount()).toBe(base + 1);

    expect(await device.getChordPhrase(actions)).toEqual(
      expect.arrayContaining(phrase),
    );

    await device.deleteChord({ actions });
    expect(await device.getChordCount()).toBe(base);
  }, 120_000);

  it("round-trips a layout key and commits to persistent flash", async () => {
    await device.setLayoutKey(0, 1, 12, 44);
    expect(await device.getLayoutKey(0, 1, 12)).toBe(44);

    // IDBFS with autoPersist is mounted by the worker: the commit survives
    // page reloads.
    await device.commit();
  }, 120_000);

  it("synthesizes keyboard events through the firmware", async () => {
    const seen: KeyboardEvent[] = [];
    const listener = (event: KeyboardEvent) => {
      if (event instanceof CCOSKeyboardEvent) {
        seen.push(event);
      } else {
        void ccos!.handleKeyEvent(event);
      }
    };
    document.body.addEventListener("keydown", listener);
    document.body.addEventListener("keyup", listener);

    const dispatch = (type: "keydown" | "keyup") =>
      document.body.dispatchEvent(
        new KeyboardEvent(type, {
          code: "KeyA",
          key: "a",
          bubbles: true,
          cancelable: true,
        }),
      );

    try {
      dispatch("keydown");
      await expect
        .poll(
          () => seen.filter((e) => e.type === "keydown").map((e) => e.key),
          {
            timeout: 15_000,
          },
        )
        .toContain("a");

      dispatch("keyup");
      await expect
        .poll(() => seen.filter((e) => e.type === "keyup").map((e) => e.key), {
          timeout: 15_000,
        })
        .toContain("a");

      const down = seen.find(
        (e) => e.type === "keydown" && e.key === "a",
      ) as KeyboardEvent;
      expect(down.code).toBe("KeyA");
      expect(down.getModifierState("Shift")).toBe(false);
    } finally {
      document.body.removeEventListener("keydown", listener);
      document.body.removeEventListener("keyup", listener);
      dispatch("keyup");
    }
  }, 60_000);

  it("is a no-op for keyboard events on inputs", async () => {
    // The guard must bail out for events targeting inputs: nothing may be
    // forwarded to the firmware (which would type through the bridge).
    const input = document.createElement("input");
    document.body.appendChild(input);

    const synthesized: KeyboardEvent[] = [];
    const listener = (event: KeyboardEvent) => {
      if (event instanceof CCOSKeyboardEvent) {
        synthesized.push(event);
      } else {
        void ccos!.handleKeyEvent(event);
      }
    };
    document.body.addEventListener("keydown", listener);

    try {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyA",
          key: "a",
          bubbles: true,
          cancelable: true,
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(synthesized).toHaveLength(0);
    } finally {
      document.body.removeEventListener("keydown", listener);
      input.remove();
    }
  }, 30_000);

  it("returns undefined when the meta has no wasm artifacts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const key = String(url);
        const path =
          "https://charachorder.io/firmware/zero_wasm/0.0.1-ccostest";
        if (key === `${path}/`) {
          return Response.json([{ type: "file", name: "meta.json" }]);
        }
        if (key === `${path}/meta.json`) {
          return Response.json({ version: "0.0.1-ccostest" });
        }
        return new Response("not found", { status: 404 });
      }),
    );

    expect(await fetchCCOS("0.0.1-ccostest")).toBeUndefined();
    vi.unstubAllGlobals();
  }, 30_000);
});
