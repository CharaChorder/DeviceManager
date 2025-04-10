import { get, writable } from "svelte/store";
import { CharaDevice } from "$lib/serial/device";
import type { Chord } from "$lib/serial/chord";
import type { Writable } from "svelte/store";
import type { CharaLayout } from "$lib/serialization/layout";
import { persistentWritable } from "$lib/storage";
import { userPreferences } from "$lib/preferences";
import { getMeta } from "$lib/meta/meta-storage";
import type { VersionMeta } from "$lib/meta/types/meta";

export const serialPort = writable<CharaDevice | undefined>();

export interface SerialLogEntry {
  type: "input" | "output" | "system";
  value: string;
}

export const serialLog = writable<SerialLogEntry[]>([]);

/**
 * Chords as read from the device
 */
export const deviceChords = persistentWritable<Chord[]>(
  "chord-library",
  [],
  () => get(userPreferences).backup,
);

/**
 * Layout as read from the device
 */
export const deviceLayout = persistentWritable<CharaLayout>(
  "layout",
  [[], [], []],
  () => get(userPreferences).backup,
);

/**
 * Settings as read from the device
 */
export const deviceSettings = persistentWritable<number[]>(
  "device-settings",
  [],
  () => get(userPreferences).backup,
);

export const syncStatus: Writable<
  "done" | "error" | "downloading" | "uploading"
> = writable("done");

export const deviceMeta = writable<VersionMeta | undefined>(undefined);

export interface ProgressInfo {
  max: number;
  current: number;
}
export const syncProgress = writable<ProgressInfo | undefined>(undefined);

export async function initSerial(manual = false, withSync = true) {
  const device = get(serialPort) ?? new CharaDevice();
  await device.init(manual);
  serialPort.set(device);
  if (withSync) {
    await sync();
  }
}

export async function sync() {
  const device = get(serialPort);
  if (!device) return;
  syncStatus.set("downloading");
  const meta = await getMeta(
    `${device.device}_${device.chipset}`.toLowerCase(),
    device.version.toString(),
  );
  deviceMeta.set(meta);
  const chordCount = await device.getChordCount();

  const maxSettings = meta.settings
    .map((it) => it.items.length)
    .reduce((a, b) => a + b, 0);

  const max = maxSettings + device.keyCount * 3 + chordCount;
  let current = 0;
  syncProgress.set({ max, current });
  function progressTick() {
    current++;
    syncProgress.set({ max, current });
  }

  const parsedSettings: number[] = [];
  for (const category of meta.settings) {
    for (const setting of category.items) {
      try {
        parsedSettings[setting.id] = await device.getSetting(setting.id);
      } catch {}
    }
    progressTick();
  }
  deviceSettings.set(parsedSettings);

  const parsedLayout: CharaLayout = [[], [], []];
  for (let layer = 1; layer <= 3; layer++) {
    for (let i = 0; i < device.keyCount; i++) {
      parsedLayout[layer - 1]![i] = await device.getLayoutKey(layer, i);
      progressTick();
    }
  }
  deviceLayout.set(parsedLayout);

  const chordInfo = [];
  for (let i = 0; i < chordCount; i++) {
    chordInfo.push(await device.getChord(i));
    progressTick();
  }
  deviceChords.set(chordInfo);
  syncStatus.set("done");
  syncProgress.set(undefined);
}
