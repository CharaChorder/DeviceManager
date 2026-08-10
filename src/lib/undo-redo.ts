import { persistentWritable } from "$lib/storage";
import { derived } from "svelte/store";
import { deviceLayout, deviceSettings } from "$lib/serial/connection";

export enum ChangeType {
  Layout,
  Setting,
}

export interface LayoutChange {
  type: ChangeType.Layout;
  id: number;
  layer: number;
  action: number;
  profile?: number;
}

export interface SettingChange {
  type: ChangeType.Setting;
  id: number;
  setting: number;
  profile?: number;
}

export interface ChangeInfo {
  isApplied: boolean;
  isCommitted?: boolean;
}

export type Change = LayoutChange | SettingChange;

export const changes = persistentWritable<Change[][]>("changes", []);

export interface Overlay {
  layout: Array<Array<Map<number, number> | undefined> | undefined>;
  settings: Array<Map<number, number> | undefined>;
}

export const overlay = derived(changes, (changes) => {
  const overlay: Overlay = {
    layout: [],
    settings: [],
  };

  for (const changeset of changes) {
    for (const change of changeset) {
      switch (change.type) {
        case ChangeType.Layout:
          change.profile ??= 0;
          overlay.layout[change.profile] ??= [];
          overlay.layout[change.profile]![change.layer] ??= new Map();
          overlay.layout[change.profile]![change.layer]!.set(
            change.id,
            change.action,
          );
          break;
        case ChangeType.Setting:
          change.profile ??= 0;
          overlay.settings[change.profile] ??= new Map();
          overlay.settings[change.profile]!.set(change.id, change.setting);
          break;
      }
    }
  }

  return overlay;
});

export const settings = derived(
  [overlay, deviceSettings],
  ([overlay, profiles]) =>
    profiles.map((settings, profile) =>
      settings.map<{ value: number } & ChangeInfo>((value, id) => ({
        value: overlay.settings[profile]?.get(id) ?? value,
        isApplied: !overlay.settings[profile]?.has(id),
      })),
    ),
);

export type KeyInfo = { action: number } & ChangeInfo;
export const layout = derived([overlay, deviceLayout], ([overlay, profiles]) =>
  profiles.map((layout, profile) =>
    layout.map(
      (actions, layer) =>
        actions.map<KeyInfo>((action, id) => ({
          action: overlay.layout[profile]?.[layer]?.get(id) ?? action,
          isApplied: !overlay.layout[profile]?.[layer]?.has(id),
        })) as [KeyInfo, KeyInfo, KeyInfo],
    ),
  ),
);
