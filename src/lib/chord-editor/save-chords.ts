import type { EditorView } from "@codemirror/view";
import { parser } from "./chords.grammar";
import { parseCharaChords } from "./action-serializer";
import { actionMetaPlugin } from "./action-meta-plugin";
import { deviceChordField } from "./chord-sync-plugin";
import type { CharaChordFile } from "$lib/share/chara-file";

export interface SaveChordsTask {
  remove: number[][];
  set: [number[], number[]][];
}

export function createSaveTask(view: EditorView): SaveChordsTask {
  const tree = parser.parse(view.state.doc.toString());
  const { ids, codes } = view.state.field(actionMetaPlugin.field);
  const deviceChords = view.state.field(deviceChordField);
  const result = parseCharaChords(tree, ids, codes, deviceChords, (from, to) =>
    view.state.doc.sliceString(from, to),
  );

  return {
    remove: result.removed.map((chord) => chord[0]),
    set: result.chords
      .filter(
        (chord) =>
          !chord.disabled &&
          (!chord.phrase ||
            chord.phrase?.originalValue !== chord.phrase?.value),
      )
      .map((chord) => [chord.input?.value ?? [], chord.phrase?.value ?? []]),
  };
}

export function applySaveTask(
  backup: CharaChordFile["chords"],
  task: SaveChordsTask,
): CharaChordFile["chords"] {
  const newBackup = [...backup];
  for (const input of task.remove) {
    const index = newBackup.findIndex((chord) => {
      return JSON.stringify(chord[0]) === JSON.stringify(input);
    });
    if (index !== -1) {
      newBackup.splice(index, 1);
    }
  }
  for (const [input, phrase] of task.set) {
    const index = newBackup.findIndex((chord) => {
      return JSON.stringify(chord[0]) === JSON.stringify(input);
    });
    if (index !== -1) {
      newBackup[index] = [input, phrase];
    } else {
      newBackup.push([input, phrase]);
    }
  }
  return newBackup;
}
