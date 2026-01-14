import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { parsedChordsEffect } from "./parsed-chords-plugin";

const changedMark = Decoration.mark({ class: "cm-changed" });

const chordMetaMark = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    const newChords = tr.effects.findLast((e) => e.is(parsedChordsEffect));
    if (!newChords) {
      return decorations.map(tr.changes);
    }
    return newChords.value.meta.map(meta => {
      if (meta.originalPhrase) {
    return underlineMark.range(meta.from, meta.to);
}
});
  },
  provide: (f) => EditorView.decorations.from(f),
});
