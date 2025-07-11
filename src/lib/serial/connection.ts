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
export const deviceLayout = persistentWritable<CharaLayout[]>(
  "layout-profiles",
  [],
  () => get(userPreferences).backup,
);

/**
 * Settings as read from the device
 */
export const deviceSettings = persistentWritable<number[][]>(
  "settings-profiles",
  [],
  () => get(userPreferences).backup,
);

export const activeProfile = persistentWritable<number>("active-profile", 0);
export const activeLayer = persistentWritable<number>("active-profile", 0);

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

  const max =
    (maxSettings + device.keyCount * device.layerCount) * device.profileCount +
    chordCount;
  let current = 0;
  activeProfile.update((it) => Math.min(it, device.profileCount - 1));
  activeLayer.update((it) => Math.min(it, device.layerCount - 1));
  syncProgress.set({ max, current });
  function progressTick() {
    current++;
    syncProgress.set({ max, current });
  }

  const parsedSettings: number[][] = Array.from(
    { length: device.profileCount },
    () => [],
  );
  for (const [profile, settings] of parsedSettings.entries()) {
    for (const category of meta.settings) {
      for (const setting of category.items) {
        try {
          settings[setting.id] = await device.getSetting(profile, setting.id);
        } catch {}
      }
      progressTick();
    }
  }
  deviceSettings.set(parsedSettings);

  const parsedLayout: CharaLayout[] = Array.from(
    { length: device.profileCount },
    () =>
      Array.from({ length: device.layerCount }, () =>
        Array.from({ length: device.keyCount }, () => 0),
      ),
  );
  for (const [profile, layout] of parsedLayout.entries()) {
    for (const [layer, keys] of layout.entries()) {
      for (let i = 0; i < keys.length; i++) {
        try {
          keys[i] = await device.getLayoutKey(profile, layer + 1, i);
        } catch {}
        progressTick();
      }
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
