import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import {
  createChordBackup,
  createLayoutBackup,
  createSettingsBackup,
  downloadBackup,
  getChangesFromChordFile,
  getChangesFromLayoutFile,
  getChangesFromSettingsFile,
  restoreBackup,
  restoreFromFile,
} from "./backup";
import { changes, ChangeType } from "$lib/undo-redo";
import {
  activeProfile,
  deviceChords,
  deviceLayout,
  deviceSettings,
  serialPort,
} from "$lib/serial/connection";
import type { CharaDevice } from "$lib/serial/device";
import type {
  CharaBackupFile,
  CharaChordFile,
  CharaLayoutFile,
  CharaSettingsFile,
} from "$lib/share/chara-file";

function reset() {
  changes.set([]);
  activeProfile.set(0);
  deviceLayout.set([
    [
      [32, 33],
      [34, 35],
    ],
    [
      [36, 37],
      [38, 39],
    ],
  ]);
  deviceSettings.set([[10, 11]]);
  deviceChords.set([{ actions: [32, 51], phrase: [0x20] }]);
  serialPort.set({ device: "ONE" } as CharaDevice);
}

describe("backup creation", () => {
  beforeEach(reset);

  it("should create a layout backup from the current profile", () => {
    const file = createLayoutBackup();
    expect(file.type).toBe("layout");
    expect(file.device).toBe("ONE");
    expect(file.layout).toEqual([
      [32, 33],
      [34, 35],
    ]);
  });

  it("should create a chord backup as action/phrase pairs", () => {
    const file = createChordBackup();
    expect(file.type).toBe("chords");
    expect(file.chords).toEqual([[[32, 51], [0x20]]]);
  });

  it("should create a settings backup as the value list", () => {
    const file = createSettingsBackup();
    expect(file.settings).toEqual([10, 11]);
  });

  it("should include overlay changes in the backups", () => {
    changes.set([
      [
        { type: ChangeType.Layout, id: 0, layer: 0, action: 100 },
        { type: ChangeType.Setting, id: 0, setting: 42 },
      ],
    ]);
    expect(createLayoutBackup().layout[0][0]).toBe(100);
    expect(createSettingsBackup().settings[0]).toBe(42);
  });
});

describe("backup change extraction", () => {
  beforeEach(reset);

  it("should skip chords that are already present", () => {
    const file: CharaChordFile = {
      charaVersion: 1,
      type: "chords",
      chords: [
        [[32, 51], [0x20]],
        [[33, 52], [0x21]],
      ],
    };
    const extracted = getChangesFromChordFile(file);
    expect(extracted).toHaveLength(1);
    expect(extracted[0]).toMatchObject({
      type: ChangeType.Chord,
      actions: [33, 52],
      phrase: [0x21],
    });
  });

  it("should extract only differing settings", () => {
    const file: CharaSettingsFile = {
      charaVersion: 1,
      type: "settings",
      settings: [10, 99],
    };
    const extracted = getChangesFromSettingsFile(file);
    expect(extracted).toEqual([
      { type: ChangeType.Setting, id: 1, setting: 99, profile: 0 },
    ]);
  });

  it("should extract only differing layout keys", () => {
    const file: CharaLayoutFile = {
      charaVersion: 1,
      type: "layout",
      layout: [[32, 99], [34, 35], []],
    };
    const extracted = getChangesFromLayoutFile(file);
    expect(extracted).toEqual([
      { type: ChangeType.Layout, layer: 0, id: 1, action: 99, profile: 0 },
    ]);
  });
});

describe("restore", () => {
  beforeEach(reset);

  it("should append chord changes from a chord file", () => {
    restoreFromFile({
      charaVersion: 1,
      type: "chords",
      chords: [[[33, 52], [0x21]]],
    });
    const last = get(changes).at(-1)!;
    expect(last).toHaveLength(1);
    expect(last[0]!.type).toBe(ChangeType.Chord);
  });

  it("should respect the `only` filter", () => {
    restoreFromFile(
      {
        charaVersion: 1,
        type: "chords",
        chords: [[[33, 52], [0x21]]],
      },
      "layout",
    );
    expect(get(changes)).toEqual([]);
  });

  it("should restore a full backup file", () => {
    const file: CharaBackupFile = {
      charaVersion: 1,
      type: "backup",
      history: [
        [
          {
            charaVersion: 1,
            type: "chords",
            chords: [[[33], [0x21]]],
          },
          {
            charaVersion: 1,
            type: "layout",
            device: "ONE",
            layout: [[99, 33], [34, 35], []],
          },
          {
            charaVersion: 1,
            type: "settings",
            settings: [42, 11],
          },
        ],
      ],
    };
    restoreFromFile(file);
    const last = get(changes).at(-1)!;
    expect(last.map((it) => it.type)).toEqual([
      ChangeType.Chord,
      ChangeType.Layout,
      ChangeType.Setting,
    ]);
  });

  it("should normalize compatible device families", () => {
    // TWO restores onto ONE
    serialPort.set({ device: "TWO" } as CharaDevice);
    expect(() =>
      restoreFromFile({
        charaVersion: 1,
        type: "backup",
        history: [
          [
            { charaVersion: 1, type: "chords", chords: [] },
            {
              charaVersion: 1,
              type: "layout",
              device: "ONE",
              layout: [[], [], []],
            },
            { charaVersion: 1, type: "settings", settings: [] },
          ],
        ],
      }),
    ).not.toThrow();
  });

  it("should reject backups from a different device", () => {
    vi.stubGlobal("alert", vi.fn());
    serialPort.set({ device: "LITE" } as CharaDevice);
    expect(() =>
      restoreFromFile({
        charaVersion: 1,
        type: "backup",
        history: [
          [
            { charaVersion: 1, type: "chords", chords: [] },
            {
              charaVersion: 1,
              type: "layout",
              device: "ONE",
              layout: [[], [], []],
            },
            { charaVersion: 1, type: "settings", settings: [] },
          ],
        ],
      }),
    ).toThrow(/incompatible/i);
    vi.unstubAllGlobals();
  });

  it("should reject an incompatible charaVersion", () => {
    expect(() =>
      restoreFromFile({
        charaVersion: 2,
        type: "chords",
        chords: [],
      } as unknown as CharaChordFile),
    ).toThrow("Incompatible backup");
  });

  it("should throw on an unknown file type", () => {
    expect(() =>
      restoreFromFile({
        charaVersion: 1,
        type: "bogus",
      } as unknown as CharaChordFile),
    ).toThrow(/Unknown backup type/);
  });

  it("should ignore a backup with an empty history", () => {
    restoreFromFile({
      charaVersion: 1,
      type: "backup",
      history: [],
    } as unknown as CharaBackupFile);
    expect(get(changes)).toEqual([]);
  });

  it("should restore layout and settings files with the only filter", () => {
    restoreFromFile(
      {
        charaVersion: 1,
        type: "layout",
        device: "ONE",
        layout: [[99, 33], [34, 35], []],
      } as CharaLayoutFile,
      "layout",
    );
    restoreFromFile(
      {
        charaVersion: 1,
        type: "settings",
        settings: [42, 11],
      } as CharaSettingsFile,
      "settings",
    );
    restoreFromFile(
      {
        charaVersion: 1,
        type: "settings",
        settings: [43, 11],
      } as CharaSettingsFile,
      "layout", // must skip settings
    );

    const appended = get(changes);
    expect(appended).toHaveLength(2);
    expect(appended[0]![0]!.type).toBe(ChangeType.Layout);
    expect(appended[1]![0]!.type).toBe(ChangeType.Setting);
  });
});

describe("restoreBackup (file input)", () => {
  beforeEach(reset);

  async function restore(
    fileName: string,
    contents: string,
    only?: "chords" | "layout" | "settings",
  ) {
    const input = document.createElement("input");
    const file = new File([contents], fileName, { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [file] });
    const event = new Event("change");
    input.dispatchEvent(event);
    await restoreBackup(event, only);
  }

  it("restores a json chord file", async () => {
    await restore(
      "chords.json",
      JSON.stringify({
        charaVersion: 1,
        type: "chords",
        chords: [[[33, 52], [0x21]]],
      }),
    );
    const last = get(changes).at(-1)!;
    expect(last[0]!.type).toBe(ChangeType.Chord);
  });

  it("converts and restores a legacy csv layout", async () => {
    await restore("layout.csv", "A1,0,99\nA1,1,98\n");
    const last = get(changes).at(-1)!;
    expect(last.map((it) => it.type)).toEqual([
      ChangeType.Layout,
      ChangeType.Layout,
    ]);
    expect(last[0]).toMatchObject({ id: 0, layer: 0, action: 99 });
  });

  it("converts and restores legacy csv chords", async () => {
    await restore("chords.csv", "a + b, c");
    const last = get(changes).at(-1)!;
    expect(last[0]!.type).toBe(ChangeType.Chord);
    expect(last[0]).toMatchObject({
      actions: [97, 98],
      phrase: [99],
    });
  });

  it("does nothing without a selected file", async () => {
    const input = document.createElement("input");
    Object.defineProperty(input, "files", { value: [] });
    const event = new Event("change");
    input.dispatchEvent(event);
    await expect(restoreBackup(event)).resolves.toBeUndefined();
    expect(get(changes)).toEqual([]);
  });
});

describe("downloadFile", () => {
  beforeEach(reset);

  it("names the download by type, device, and date", () => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:fake"),
      revokeObjectURL: vi.fn(),
    });
    const clicked: HTMLAnchorElement[] = [];
    const spy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        clicked.push(this);
      });

    downloadBackup();

    expect(clicked).toHaveLength(1);
    expect(clicked[0]!.getAttribute("download")).toMatch(
      /^backup-ONE-\d{4}-\d{2}-\d{2}T.*\.json$/,
    );
    expect(vi.mocked(URL.createObjectURL)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(URL.revokeObjectURL)).toHaveBeenCalledTimes(1);
    spy.mockRestore();
    vi.unstubAllGlobals();
  });
});
