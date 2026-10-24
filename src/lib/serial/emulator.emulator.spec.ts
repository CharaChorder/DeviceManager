import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createEmulator,
  loadFirmware,
  type EmulatorHandle,
  type LoadedFirmware,
} from "../../../test/utils/emulator";
import { CharaDevice } from "$lib/serial/device";
import type { Chord } from "$lib/serial/chord";

/**
 * End-to-end tests against the real CCOS firmware compiled to WebAssembly.
 *
 * The artifacts are fetched from the official firmware endpoints
 * (`https://charachorder.io/firmware/zero_wasm/<version>/meta.json`) and are
 * not stored in this repository. This is the opt-in lane: `pnpm test:emulator`.
 *
 * The emulator boots with an empty flash, so tests that need factory data
 * (starter chords, parameters) issue the firmware's `RST` factory commands
 * first, mirroring what the app does during setup.
 */

const VERSION = "3.1.0-beta.3";

let firmware: LoadedFirmware;
let emu: EmulatorHandle;
let device: CharaDevice;
let timer: ReturnType<typeof setInterval>;

beforeAll(async () => {
  firmware = await loadFirmware(VERSION);
  emu = await createEmulator(firmware, { logWire: true });
  device = new CharaDevice(emu.port);
  // drive the firmware scheduler while the tests talk to it
  timer = setInterval(() => emu.pump(2), 4);
  await device.init();
}, 120_000);

afterAll(() => {
  clearInterval(timer);
  emu?.dispose();
});

describe("CCOS wasm emulator", () => {
  it("performs the serial handshake with the firmware", () => {
    expect(device.version).toBe(VERSION);
    expect(device.company).toBe("CHARACHORDER");
    expect(device.device).toBe("ZERO");
    expect(device.chipset).toBe("WASM");
    expect(device.keyCount).toBe(256);
    expect(device.profileCount).toBe(3);
    expect(device.layerCount).toBe(4);
  });

  it("answers protocol queries", async () => {
    // `RAM` and `QRY` are not part of this firmware's serial API
    // (`CMD CMD,ID,VERSION,CML,VAR,RST,SIM`); they target newer protocol
    // revisions, so only the CML queries are exercised here.
    expect(Number.isFinite(await device.getProgress())).toBe(true);
    expect(await device.getChordCount()).toBeGreaterThanOrEqual(0);
  }, 30_000);

  it("reads chords back by index", async () => {
    // The wasm flash starts empty (this build carries no embedded factory
    // chords), so seed one chord via the library command, then read it
    // back by its index.
    await device.reset("CLEARCML");

    const chord: Chord = { actions: [32, 51, 38], phrase: [0x20, 0x71] };
    await device.setChord(chord);

    const index = (await device.getChordCount()) - 1;
    const stored = await device.getChord(index);
    expect(stored.actions.length).toBeGreaterThan(0);
    expect(stored.actions.length).toBeLessThanOrEqual(12);
    expect(stored.actions.slice(0, 3)).toEqual([32, 51, 38]);
    expect(stored.phrase.slice(0, 2)).toEqual([0x20, 0x71]);
  }, 120_000);

  it("stores, queries and deletes chords", async () => {
    const before = await device.getChordCount();

    const chord: Chord = { actions: [32, 51], phrase: [0x20, 0x68] };
    await device.setChord(chord);

    expect(await device.getChordCount()).toBe(before + 1);
    expect(await device.getChordPhrase([32, 51])).toEqual([0x20, 0x68]);

    await device.deleteChord(chord);
    expect(await device.getChordCount()).toBe(before);
  }, 60_000);

  it("round-trips layout keys", async () => {
    await device.setLayoutKey(0, 1, 0, 41);
    expect(await device.getLayoutKey(0, 1, 0)).toBe(41);

    await device.setLayoutKey(2, 4, 89, 32);
    expect(await device.getLayoutKey(2, 4, 89)).toBe(32);

    // persisted to the emulated flash
    await device.commit();
  }, 60_000);

  it("round-trips settings", async () => {
    await device.reset("PARAMS");

    // "debounce press" (0x15) and "debounce release" (0x16), profile 0.
    await device.setSetting(0, 0x15, 5);
    expect(await device.getSetting(0, 0x15)).toBe(5);

    await device.setSetting(0, 0x16, 7);
    expect(await device.getSetting(0, 0x16)).toBe(7);
    expect(await device.getSetting(0, 0x15)).toBe(5);

    await device.commit();
  }, 60_000);

  it("reports pressed keys over the wire", async () => {
    // The firmware pushes HID reports through the report callback that
    // the harness registered with `init()`.
    emu.pressKey(41);
    for (let i = 0; i < 20; i++) emu.pump(2);
    expect(emu.reports.some((report) => report.keys.includes(41))).toBe(true);

    emu.releaseKey(41);
    for (let i = 0; i < 20; i++) emu.pump(2);
  }, 30_000);

  it("clears the chord library with CLEARCML", async () => {
    await device.setChord({ actions: [0x100, 0x101], phrase: [0x20] });
    expect(await device.getChordCount()).toBeGreaterThan(0);

    await device.reset("CLEARCML");
    expect(await device.getChordCount()).toBe(0);
  }, 120_000);

  it("reports missing chords as not found", async () => {
    expect(await device.getChordPhrase([0x7ff, 0x7fe, 0x7fd])).toBeUndefined();
  }, 30_000);

  it("keeps settings per profile", async () => {
    // 0x15 = "debounce press"; profiles 0 and 1 must not interfere.
    await device.setSetting(0, 0x15, 3);
    await device.setSetting(1, 0x15, 42);

    expect(await device.getSetting(0, 0x15)).toBe(3);
    expect(await device.getSetting(1, 0x15)).toBe(42);

    await device.setSetting(0, 0x15, 30);
    expect(await device.getSetting(0, 0x15)).toBe(30);
    expect(await device.getSetting(1, 0x15)).toBe(42);
  }, 60_000);

  it("writes flash sector directories on commit", async () => {
    expect(emu.flashFiles().length).toBeGreaterThan(0);
  });

  it("runs a second device instance with an independent library", async () => {
    const emu2 = await createEmulator(firmware);
    const device2 = new CharaDevice(emu2.port);
    const timer2 = setInterval(() => emu2.pump(2), 4);
    try {
      await device2.init();
      expect(device2.version).toBe(VERSION);

      const countA = await device.getChordCount();
      const countB = await device2.getChordCount();
      expect(countB).toBe(0);

      await device2.setChord({ actions: [0x140, 0x141], phrase: [0x20] });
      expect(await device2.getChordCount()).toBe(1);
      expect(await device.getChordCount()).toBe(countA);
    } finally {
      clearInterval(timer2);
      emu2.dispose();
    }
  }, 120_000);
});
