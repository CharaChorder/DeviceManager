import type { CharaChordFile } from "$lib/share/chara-file";
import { StateEffect, StateField } from "@codemirror/state";

export const chordSyncEffect = StateEffect.define<CharaChordFile["chords"]>();

export const deviceChordField = StateField.define<CharaChordFile["chords"]>({
  create() {
    return [];
  },
  update(value, transaction) {
    // save initial device chords
    // compare new device chords with initial device chords
    // take changed/new/removed chords
    // compare current editor chords with initial device chords
    // compare two change sets
    // apply removals if the chord didn't change on either end
    // apply
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
