import type {
  CharaBackupFile,
  CharaChordFile,
  CharaFile,
  CharaLayoutFile,
  CharaSettingsFile,
} from "$lib/share/chara-file.js";
import type { Change } from "$lib/undo-redo.js";
import {
  changes,
  ChangeType,
  chords,
  layout,
  settings,
} from "$lib/undo-redo.js";
import { get } from "svelte/store";
import { activeProfile, serialPort } from "../serial/connection";
import { csvLayoutToJson, isCsvLayout } from "$lib/backup/compat/legacy-layout";
import { isCsvChords, csvChordsToJson } from "./compat/legacy-chords";

export function downloadFile<T extends CharaFile<string>>(contents: T) {
  const downloadUrl = URL.createObjectURL(
    new Blob([JSON.stringify(contents)], { type: "application/json" }),
  );
  const element = document.createElement("a");
  element.setAttribute(
    "download",
    `${contents.type}-${
      get(serialPort)?.device
    }-${new Date().toISOString()}.json`,
  );
  element.href = downloadUrl;
  element.setAttribute("target", "_blank");
  element.click();
  URL.revokeObjectURL(downloadUrl);
}

export function downloadBackup() {
  downloadFile<CharaBackupFile>({
    charaVersion: 1,
    type: "backup",
    history: [
      [createChordBackup(), createLayoutBackup(), createSettingsBackup()],
    ],
  });
}

export function createLayoutBackup(): CharaLayoutFile {
  return {
    charaVersion: 1,
    type: "layout",
    device: get(serialPort)?.device,
    layout: (get(layout)[get(activeProfile)]?.map((it) =>
      it.map((it) => it.action),
    ) ?? []) as [number[], number[], number[]],
  };
}

export function createChordBackup(): CharaChordFile {
  return {
    charaVersion: 1,
    type: "chords",
    chords: get(chords).map((it) => [it.actions, it.phrase]),
  };
}

export function createSettingsBackup(): CharaSettingsFile {
  return {
    charaVersion: 1,
    type: "settings",
    settings: get(settings)[get(activeProfile)]?.map((it) => it.value) ?? [],
  };
}

export async function restoreBackup(event: Event) {
  const input = (event.target as HTMLInputElement).files![0];
  if (!input) return;
  const text = await input.text();
  if (input.name.endsWith(".json")) {
    restoreFromFile(JSON.parse(text));
  } else if (isCsvLayout(text)) {
    restoreFromFile(csvLayoutToJson(text));
  } else if (isCsvChords(text)) {
    restoreFromFile(csvChordsToJson(text));
  } else {
  }
}

export function restoreFromFile(
  file: CharaBackupFile | CharaSettingsFile | CharaLayoutFile | CharaChordFile,
) {
  if (file.charaVersion !== 1) throw new Error("Incompatible backup");
  switch (file.type) {
    case "backup": {
      const recent = file.history[0];
      if (!recent) return;
      let backupDevice = recent[1].device;
      if (backupDevice === "TWO" || backupDevice === "M4G")
        backupDevice = "ONE";
      let currentDevice = get(serialPort)?.device;
      if (currentDevice === "TWO" || backupDevice === "M4G")
        currentDevice = "ONE";

      if (backupDevice !== currentDevice) {
        alert("Backup is incompatible with this device");
        throw new Error("Backup is incompatible with this device");
      }

      changes.update((changes) => {
        changes.push([
          ...getChangesFromChordFile(recent[0]),
          ...getChangesFromLayoutFile(recent[1]),
          ...getChangesFromSettingsFile(recent[2]),
        ]);
        return changes;
      });
      break;
    }
    case "chords": {
      changes.update((changes) => {
        changes.push(getChangesFromChordFile(file));
        return changes;
      });
      break;
    }
    case "layout": {
      changes.update((changes) => {
        changes.push(getChangesFromLayoutFile(file));
        return changes;
      });
      break;
    }
    case "settings": {
      changes.update((changes) => {
        changes.push(getChangesFromSettingsFile(file));
        return changes;
      });
      break;
    }
    default: {
      throw new Error(
        `Unknown backup type "${(file as CharaFile<string>).type}"`,
      );
    }
  }
}

export function getChangesFromChordFile(file: CharaChordFile) {
  const changes: Change[] = [];
  const existingChords = new Set(
    get(chords).map(({ phrase, actions }) => JSON.stringify([actions, phrase])),
  );
  for (const [input, output] of file.chords) {
    if (existingChords.has(JSON.stringify([input, output]))) {
      continue;
    }
    changes.push({
      type: ChangeType.Chord,
      actions: input,
      phrase: output,
      id: input,
    });
  }
  return changes;
}

export function getChangesFromSettingsFile(file: CharaSettingsFile) {
  const changes: Change[] = [];
  for (const [id, value] of file.settings.entries()) {
    const setting = get(settings)[get(activeProfile)]?.[id];
    if (setting !== undefined && setting.value !== value) {
      changes.push({
        type: ChangeType.Setting,
        id,
        setting: value,
        profile: get(activeProfile),
      });
    }
  }
  return changes;
}

export function getChangesFromLayoutFile(file: CharaLayoutFile) {
  const changes: Change[] = [];
  for (const [layer, keys] of file.layout.entries()) {
    for (const [id, action] of keys.entries()) {
      if (get(layout)[get(activeProfile)]?.[layer]?.[id]?.action !== action) {
        changes.push({
          type: ChangeType.Layout,
          layer,
          id,
          action,
          profile: get(activeProfile),
        });
      }
    }
  }
  return changes;
}
