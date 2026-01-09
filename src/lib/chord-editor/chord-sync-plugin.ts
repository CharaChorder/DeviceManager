import type { CharaChordFile } from "$lib/share/chara-file";
import { StateEffect, StateField } from "@codemirror/state";

export const chordSyncEffect = StateEffect.define<CharaChordFile["chords"]>();

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
  compare(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  toJSON(value) {
    return value;
  },
  fromJSON(value) {
    return value;
  },
});
