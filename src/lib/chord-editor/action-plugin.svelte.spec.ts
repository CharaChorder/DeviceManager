import { describe, expect, it } from "vitest";
import { EditorView } from "@codemirror/view";
import { actionPlugin } from "./action-plugin";
import { chordLanguageSupport } from "./chords-grammar-plugin";

/**
 * The action plugin replaces `<...>` explicit actions in the chord editor
 * with rendered widget components (icons/labels), driven by the chord
 * grammar's parse tree.
 */

function createEditor(doc: string) {
  return new EditorView({
    doc,
    extensions: [chordLanguageSupport(), actionPlugin],
    parent: document.body,
  });
}

const widgets = (view: EditorView) =>
  view.dom.querySelectorAll('span[contenteditable="false"]').length;

describe("actionPlugin", () => {
  it("renders a widget for each explicit action", async () => {
    const view = createEditor("<65><LEFT_SHIFT>=>ab");
    try {
      await expect.poll(() => widgets(view)).toBe(2);
      const widget = view.dom.querySelector('span[contenteditable="false"]')!;
      // the literal "<65>" text is replaced by the rendered key label
      expect(widget.textContent).not.toContain("<65>");
      expect(widget.querySelector("kbd")).not.toBeNull();
    } finally {
      view.destroy();
    }
  });

  it("renders no widgets for plain letter inputs", async () => {
    const view = createEditor("ab=>cd");
    try {
      // let the parser settle, then assert nothing is decorated
      await expect.poll(() => widgets(view)).toBe(0);
    } finally {
      view.destroy();
    }
  });

  it("renders no widget for an unterminated explicit action", async () => {
    const view = createEditor("<65=>ab");
    try {
      await expect.poll(() => widgets(view)).toBe(0);
    } finally {
      view.destroy();
    }
  });

  it("updates widgets when the document changes", async () => {
    const view = createEditor("ab=>cd");
    try {
      await expect.poll(() => widgets(view)).toBe(0);

      view.dispatch({ changes: { from: 0, insert: "<99>" } });
      await expect.poll(() => widgets(view)).toBe(1);

      view.dispatch({ changes: { from: 0, to: 4, insert: "" } });
      await expect.poll(() => widgets(view)).toBe(0);
    } finally {
      view.destroy();
    }
  });
});
