import { persistentWritable } from "$lib/storage";
import { derived } from "svelte/store";
import { hashChord, type Chord } from "$lib/serial/chord";
import {
  deviceChords,
  deviceLayout,
  deviceSettings,
} from "$lib/serial/connection";
import { KEYMAP_CODES } from "$lib/serial/keymap-codes";

export enum ChangeType {
  Layout,
  Chord,
  Setting,
}

export interface LayoutChange {
  type: ChangeType.Layout;
  id: number;
  layer: number;
  action: number;
}

export interface ChordChange {
  type: ChangeType.Chord;
  deleted?: true;
  id: number[];
  actions: number[];
  phrase: number[];
}

export interface SettingChange {
  type: ChangeType.Setting;
  id: number;
  setting: number;
}

export interface ChangeInfo {
  isApplied: boolean;
  isCommitted?: boolean;
}

export type Change = LayoutChange | ChordChange | SettingChange;

export const changes = persistentWritable<Change[]>("changes", []);

export interface Overlay {
  layout: [Map<number, number>, Map<number, number>, Map<number, number>];
  chords: Map<string, Chord & { deleted: boolean }>;
  settings: Map<number, number>;
}

export const overlay = derived(changes, (changes) => {
  const overlay: Overlay = {
    layout: [new Map(), new Map(), new Map()],
    chords: new Map(),
    settings: new Map(),
  };

  for (const change of changes) {
    switch (change.type) {
      case ChangeType.Layout:
        overlay.layout[change.layer]?.set(change.id, change.action);
        break;
      case ChangeType.Chord:
        overlay.chords.set(JSON.stringify(change.id), {
          actions: change.actions,
          phrase: change.phrase,
          deleted: change.deleted ?? false,
        });
        break;
      case ChangeType.Setting:
        overlay.settings.set(change.id, change.setting);
        break;
    }
  }

  return overlay;
});

export const settings = derived(
  [overlay, deviceSettings],
  ([overlay, settings]) =>
    settings.map<{ value: number } & ChangeInfo>((value, id) => ({
      value: overlay.settings.get(id) ?? value,
      isApplied: !overlay.settings.has(id),
    })),
);

export type KeyInfo = { action: number } & ChangeInfo;
export const layout = derived([overlay, deviceLayout], ([overlay, layout]) =>
  layout.map(
    (actions, layer) =>
      actions.map<KeyInfo>((action, id) => ({
        action: overlay.layout[layer]?.get(id) ?? action,
        isApplied: !overlay.layout[layer]?.has(id),
      })) as [KeyInfo, KeyInfo, KeyInfo],
  ),
);

export type ChordInfo = Chord &
  ChangeInfo & {
    phraseChanged: boolean;
    actionsChanged: boolean;
    sortBy: string;
  } & {
    id: number[];
    deleted: boolean;
  };
export const chords = derived([overlay, deviceChords], ([overlay, chords]) => {
  const newChords = new Set(overlay.chords.keys());

  const changedChords = chords.map<ChordInfo>((chord) => {
    const id = JSON.stringify(chord.actions);
    if (overlay.chords.has(id)) {
      newChords.delete(id);
      const changedChord = overlay.chords.get(id)!;
      return {
        id: chord.actions,
        // use the old phrase for stable editing
        sortBy: chord.phrase.map((it) => KEYMAP_CODES.get(it)?.id ?? it).join(),
        actions: changedChord.actions,
        phrase: changedChord.phrase,
        actionsChanged: id !== JSON.stringify(changedChord.actions),
        phraseChanged:
          JSON.stringify(chord.phrase) !== JSON.stringify(changedChord.phrase),
        isApplied: false,
        deleted: changedChord.deleted,
      };
    } else {
      return {
        id: chord.actions,
        sortBy: chord.phrase.map((it) => KEYMAP_CODES.get(it)?.id ?? it).join(),
        actions: chord.actions,
        phrase: chord.phrase,
        phraseChanged: false,
        actionsChanged: false,
        isApplied: true,
        deleted: false,
      };
    }
  });
  for (const id of newChords) {
    const chord = overlay.chords.get(id)!;
    changedChords.push({
      sortBy: "",
      isApplied: false,
      actionsChanged: true,
      phraseChanged: false,
      deleted: chord.deleted,
      id: JSON.parse(id),
      phrase: chord.phrase,
      actions: chord.actions,
    });
  }

  return changedChords.sort(({ sortBy: a }, { sortBy: b }) =>
    a.localeCompare(b),
  );
});

export const chordHashes = derived(
  chords,
  (chords) =>
    new Map(chords.map((chord) => [hashChord(chord.actions), chord] as const)),
);
