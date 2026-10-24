import { afterEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import {
  activeLayer,
  activeProfile,
  deviceChords,
  deviceLayout,
  deviceMeta,
  deviceSettings,
  forceWebUSB,
  initSerial,
  serialObject,
  serialPort,
  sync,
  syncProgress,
  syncStatus,
  waitForDevice,
} from "$lib/serial/connection";
import { CharaDevice } from "$lib/serial/device";
import { stringifyChordActions, stringifyPhrase } from "$lib/serial/chord";
import { deviceFor, MockPort } from "../../../test/utils/mock-port";

/**
 * `connection.ts` orchestration tests.
 *
 * Runs in the browser lane: `CharaDevice` needs coherent Web Streams and
 * the module registers a `navigator.serial` listener at import time.
 */

const actions = [32, 51, 38];
const phrase = [0x20, 0x71];
const actionsHex = stringifyChordActions(actions);
const phraseHex = stringifyPhrase(phrase);

afterEach(() => {
  serialPort.set(undefined);
  syncStatus.set("done");
  syncProgress.set(undefined);
  forceWebUSB.set(false);
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("serialObject", () => {
  it("uses the native serial object by default", () => {
    expect(get(serialObject)).toBe(navigator.serial);
  });

  it("switches to the polyfill when Web USB is forced", () => {
    forceWebUSB.set(true);
    const polyfill = get(serialObject);
    expect(polyfill).not.toBe(navigator.serial);
    expect(typeof polyfill.requestPort).toBe("function");

    forceWebUSB.set(false);
    expect(get(serialObject)).toBe(navigator.serial);
  });
});

describe("initSerial", () => {
  it("opens the device and publishes it on the store", async () => {
    const [, port] = deviceFor();
    await initSerial(port, false);

    const device = get(serialPort);
    expect(device).toBeInstanceOf(CharaDevice);
    expect(device?.version).toBe("3.1.0-beta.3");
    expect(port.openCount).toBeGreaterThanOrEqual(2);
  });

  it("closes a previously connected device", async () => {
    const [, first] = deviceFor();
    await initSerial(first, false);
    const previous = get(serialPort)!;
    const [, second] = deviceFor();

    await initSerial(second, false);

    const closeCountAfterInit = first.closeCount;
    await previous.close();
    // `initSerial` already closed it once (best-effort), so this close is
    // the second one on the first port.
    expect(first.closeCount).toBe(closeCountAfterInit + 1);
    expect(get(serialPort)).not.toBe(previous);
  });

  it("clears the store when the serial port disconnects", async () => {
    const [, port] = deviceFor();
    await initSerial(port, false);
    expect(get(serialPort)).toBeDefined();

    navigator.serial.dispatchEvent(new Event("disconnect"));
    expect(get(serialPort)).toBeUndefined();
  });
});

describe("waitForDevice", () => {
  it("polls the loader progress until it completes", async () => {
    const [device, port] = deviceFor();
    await device.init();
    device.version = "3.1.1";

    const progressReplies = ["CML C5 0.4", "CML C5 0.9", "CML C5 1"];
    port.onCommand = (command) => {
      if (command === "CML C5") {
        const reply = progressReplies.shift() ?? "CML C5 1";
        port.respond(reply);
      }
    };

    await waitForDevice(device);

    expect(get(syncProgress)).toEqual({ max: 0.6, current: 0.6 });
  });

  it("is a no-op on firmwares without loader progress", async () => {
    const [device] = deviceFor();
    await device.init(); // 3.1.0-beta.3 < 3.1.0
    await waitForDevice(device);
    expect(get(syncProgress)).toBeUndefined();
  });
});

describe("sync", () => {
  it("returns without a device", async () => {
    await expect(sync()).resolves.toBeUndefined();
    expect(get(syncStatus)).toBe("done");
  });

  it("downloads settings, layout and chords into the stores", async () => {
    // A small geometry (ONE M0: 1 profile, 3 layers, 90 keys) keeps the
    // command count manageable.
    vi.stubEnv("VITE_FIRMWARE_URL", "https://meta.test/firmware");
    const path = "https://meta.test/firmware/one_m0/2.1.1";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const key = String(url);
        if (key === `${path}/`) {
          return Response.json([{ type: "file", name: "meta.json" }]);
        }
        if (key === `${path}/meta.json`) {
          return Response.json({ version: "2.1.1", settings: "settings.json" });
        }
        if (key === `${path}/settings.json`) {
          return Response.json([
            { name: "keyboard", items: [{ id: 0x15 }, { id: 0x16 }] },
          ]);
        }
        return new Response("not found", { status: 404 });
      }),
    );

    const port = new MockPort();
    port.onCommand = (command) => {
      if (command === "VERSION") port.respond("VERSION 2.1.1");
      else if (command === "ID") port.respond("ID CHARACHORDER ONE M0");
      else if (command.startsWith("VAR B1 ")) port.respond(`${command} 5 0`);
      else if (command.startsWith("VAR B3 ")) port.respond(`${command} 41 0`);
      else if (command === "CML C0") port.respond("CML C0 2");
      else if (command.startsWith("CML C1 "))
        port.respond(`${command} ${actionsHex} ${phraseHex} 0`);
      else if (command === "CML C5") port.respond("CML C5 1");
    };
    await initSerial(port, false);

    const progressValues: { max: number; current: number }[] = [];
    const unsubscribe = syncProgress.subscribe((it) => {
      if (it) progressValues.push(it);
    });

    await sync();
    unsubscribe();

    const device = get(serialPort)!;
    expect(device.keyCount).toBe(90);
    expect(get(deviceMeta)?.version).toBe("2.1.1");

    // settings: both ids (0x15=21, 0x16=22) answered with 5
    const settings = get(deviceSettings);
    expect(settings).toHaveLength(1);
    expect(settings[0]![21]).toBe(5);
    expect(settings[0]![22]).toBe(5);

    // layout: 1 profile * 3 layers * 90 keys, all answered 41
    const layout = get(deviceLayout);
    expect(layout).toHaveLength(1);
    expect(layout[0]).toHaveLength(3);
    expect(layout[0]![0]).toHaveLength(90);
    expect(layout[0]![2]![89]).toBe(41);

    // chords
    const chords = get(deviceChords);
    expect(chords).toHaveLength(2);
    expect(chords[0]!.actions.slice(0, 3)).toEqual(actions);
    expect(chords[1]!.phrase.slice(0, 2)).toEqual(phrase);

    expect(get(syncStatus)).toBe("done");
    expect(get(syncProgress)).toBeUndefined();

    // progress advanced monotonically towards the nominal max
    expect(progressValues[0]!.max).toBe((2 + 90 * 3) * 1 + 2);
    const currents = progressValues.map((it) => it.current);
    expect(currents).toEqual([...currents].sort((a, b) => a - b));
    expect(currents.at(-1)).toBeGreaterThan(0);

    expect(get(activeProfile)).toBe(0);
    expect(get(activeLayer)).toBe(0);
  }, 30_000);
});

describe("store persistence", () => {
  it("clamps active profile and layer to the device geometry", async () => {
    const port = new MockPort();
    port.onCommand = (command) => {
      if (command === "VERSION") port.respond("VERSION 3.1.0-beta.3");
      else if (command === "ID") port.respond("ID CHARACHORDER ZERO WASM");
      else if (command === "CML C0") port.respond("CML C0 0");
      else if (command.startsWith("VAR B1 ")) port.respond(`${command} 1 0`);
      else if (command.startsWith("VAR B3 ")) port.respond(`${command} 41 0`);
    };
    await initSerial(port, false);

    // ZERO WASM: 3 profiles, 4 layers
    activeProfile.set(9);
    activeLayer.set(9);

    const metaPath = "https://meta.test/firmware/zero_wasm/3.1.0-beta.3";
    vi.stubEnv("VITE_FIRMWARE_URL", "https://meta.test/firmware");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const key = String(url);
        if (key === `${metaPath}/`) {
          return Response.json([{ type: "file", name: "meta.json" }]);
        }
        if (key === `${metaPath}/meta.json`) {
          return Response.json({
            version: "3.1.0-beta.3",
            settings: "settings.json",
          });
        }
        if (key === `${metaPath}/settings.json`) {
          return Response.json([{ name: "keyboard", items: [{ id: 0x15 }] }]);
        }
        return new Response("not found", { status: 404 });
      }),
    );

    await sync();

    expect(get(activeProfile)).toBe(2);
    expect(get(activeLayer)).toBe(3);
  }, 60_000);
});
