import type { EditorState } from "@codemirror/state";
import { EditorView, showPanel, type Panel } from "@codemirror/view";
import { parsedChordsField } from "./parsed-chords-plugin";

function getChanges(state: EditorState): string {
  const parsed = state.field(parsedChordsField);
  const added = parsed.chords.reduce(
    (acc, chord) =>
      acc + (chord.phrase && chord.phrase.originalValue === undefined ? 1 : 0),
    0,
  );
  const changed = parsed.chords.reduce(
    (acc, chord) =>
      acc +
      (chord.phrase &&
      chord.phrase.originalValue &&
      chord.phrase.originalValue !== chord.phrase.value
        ? 1
        : 0),
    0,
  );
  const removed = parsed.removed.length;
  return `+${added} ~${changed} -${removed} (${parsed.chords.length} total)`;
}

function wordCountPanel(view: EditorView): Panel {
  let dom = document.createElement("div");
  dom.textContent = getChanges(view.state);
  return {
    dom,
    update(update) {
      dom.textContent = getChanges(update.state);
    },
  };
}

export function changesPanel() {
  return showPanel.of(wordCountPanel);
}
