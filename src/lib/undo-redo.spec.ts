import { beforeEach, describe, expect, it } from "vitest";
import { get } from "svelte/store";
import {
  changes,
  ChangeType,
  chordHashes,
  chords,
  duplicateChords,
  layout,
  overlay,
  settings,
  type Change,
} from "./undo-redo";
import {
  activeProfile,
  deviceChords,
  deviceLayout,
  deviceSettings,
} from "$lib/serial/connection";
import { hashChord } from "$lib/serial/chord";

function reset() {
  changes.set([]);
  activeProfile.set(0);
  deviceLayout.set([
    [
      [32, 33],
      [34, 35],
      [36, 37],
    ],
  ]);
  deviceSettings.set([[10, 11, 12]]);
  deviceChords.set([{ actions: [32, 51], phrase: [0x20] }]);
}

describe("undo-redo overlay", () => {
  beforeEach(reset);

  it("should be transparent without changes", () => {
    const overlayValue = get(overlay);
    expect(overlayValue.chords.size).toBe(0);

    const layoutValue = get(layout);
    expect(layoutValue[0]![0]![0]).toEqual({ action: 32, isApplied: true });

    const settingsValue = get(settings);
    expect(settingsValue[0]![2]).toEqual({ value: 12, isApplied: true });
  });

  it("should overlay a layout change", () => {
    changes.set([
      [
        {
          type: ChangeType.Layout,
          id: 0,
          layer: 0,
          action: 100,
        },
      ],
    ]);
    const entry = get(layout)[0]![0]![0];
    expect(entry.action).toBe(100);
    expect(entry.isApplied).toBe(false);
    // untouched keys stay applied
    expect(get(layout)[0]![0]![1]).toEqual({ action: 33, isApplied: true });
  });

  it("should overlay a setting change per profile", () => {
    changes.set([
      [{ type: ChangeType.Setting, id: 1, setting: 99, profile: 0 }],
    ]);
    expect(get(settings)[0]![1]).toEqual({ value: 99, isApplied: false });
  });

  it("should mark an edited chord as changed", () => {
    changes.set([
      [
        {
          type: ChangeType.Chord,
          id: [32, 51],
          actions: [32, 51],
          phrase: [0x21],
        },
      ],
    ]);
    const chord = get(chords)[0]!;
    expect(chord.phrase).toEqual([0x21]);
    expect(chord.isApplied).toBe(false);
    expect(chord.phraseChanged).toBe(true);
    expect(chord.actionsChanged).toBe(false);
    expect(chord.deleted).toBe(false);
  });

  it("should mark a deleted chord", () => {
    changes.set([
      [
        {
          type: ChangeType.Chord,
          deleted: true,
          id: [32, 51],
          actions: [32, 51],
          phrase: [0x20],
        },
      ],
    ]);
    expect(get(chords)[0]!.deleted).toBe(true);
  });

  it("should append new chords from the overlay", () => {
    changes.set([
      [
        {
          type: ChangeType.Chord,
          id: [33, 52],
          actions: [33, 52],
          phrase: [0x21],
        },
      ],
    ]);
    const list = get(chords);
    expect(list).toHaveLength(2);
    const added = list.find((it) => it.id[0] === 33)!;
    expect(added.actionsChanged).toBe(true);
    expect(added.isApplied).toBe(false);
  });

  it("should find duplicate chords by actions", () => {
    deviceChords.set([
      { actions: [32, 51], phrase: [0x20] },
      { actions: [32, 51], phrase: [0x21] },
      { actions: [33], phrase: [0x22] },
    ]);
    const duplicates = get(duplicateChords);
    expect(duplicates.has(JSON.stringify([32, 51]))).toBe(true);
    expect(duplicates.has(JSON.stringify([33]))).toBe(false);
  });

  it("should index chords by firmware hash", () => {
    const map = get(chordHashes);
    expect(map.get(hashChord([32, 51]))?.phrase).toEqual([0x20]);
  });

  it("should apply the last of stacked changesets", () => {
    const first: Change[] = [
      { type: ChangeType.Layout, id: 0, layer: 0, action: 100 },
    ];
    const second: Change[] = [
      { type: ChangeType.Layout, id: 0, layer: 0, action: 200 },
    ];
    changes.set([first, second]);
    expect(get(layout)[0]![0]![0].action).toBe(200);
  });
});
