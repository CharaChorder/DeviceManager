import type { CharaChordFile } from "$lib/share/chara-file";
import { StateEffect, StateField } from "@codemirror/state";
import { actionMetaPlugin } from "./action-meta-plugin";
import { syncCharaChords } from "./chord-sync";
import type { EditorView } from "@codemirror/view";

const chordSyncEffect = StateEffect.define<CharaChordFile["chords"]>();

export function editorSyncChords(
  view: EditorView,
  newDeviceChords: CharaChordFile["chords"],
) {
  const { ids, codes } = view.state.field(actionMetaPlugin.field);
  const oldDeviceChords = view.state.field(deviceChordField);
  const changes = syncCharaChords(
    oldDeviceChords,
    newDeviceChords,
    ids,
    codes,
    view.state.doc.toString(),
  );
  view.dispatch({
    effects: chordSyncEffect.of(newDeviceChords),
    changes,
  });
}

export const deviceChordField = StateField.define<CharaChordFile["chords"]>({
  create() {
    return [];
  },
  update(value, transaction) {
    return (
      transaction.effects.findLast((it) => it.is(chordSyncEffect))?.value ??
      value
    );
  },
  toJSON(value) {
    return value;
  },
  fromJSON(value) {
    return value;
  },
});
