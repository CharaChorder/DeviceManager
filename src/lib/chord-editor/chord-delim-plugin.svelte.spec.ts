import { describe, expect, it } from "vitest";
import { EditorView } from "@codemirror/view";
import { chordLanguageSupport } from "./chords-grammar-plugin";
import { delimPlugin } from "./chord-delim-plugin";

/**
 * The delimiter plugin replaces `=>` phrase delimiters with a rendered
 * ⇛ glyph. Plain phrases get a concatenator button that inserts `<JOIN>`
 * into the phrase; phrases already starting with `<JOIN>` render the
 * glyph without the button.
 */

function createEditor(doc: string) {
  return new EditorView({
    doc,
    extensions: [chordLanguageSupport(), delimPlugin],
    parent: document.body,
  });
}

const widgets = (view: EditorView) =>
  view.dom.querySelectorAll('span[contenteditable="false"]');

describe("delimPlugin", () => {
  it("replaces each phrase delimiter with the concatenator glyph", async () => {
    const view = createEditor("ab=>cd\nef=>gh");
    try {
      await expect.poll(() => widgets(view).length).toBe(2);
      expect(widgets(view)[0]!.textContent).toContain("⇛");
      expect(widgets(view)[0]!.textContent).not.toContain("=>");
    } finally {
      view.destroy();
    }
  });

  it("offers the concatenator button for plain phrases", async () => {
    const view = createEditor("ab=>cd");
    try {
      await expect
        .poll(() => widgets(view)[0]?.querySelector("button"))
        .not.toBeNull();
    } finally {
      view.destroy();
    }
  });

  it("hides the button when the phrase already joins", async () => {
    const view = createEditor("ab=><JOIN>c");
    try {
      await expect.poll(() => widgets(view).length).toBe(1);
      // a joined phrase renders the plain glyph, never the button
      await expect
        .poll(() => widgets(view)[0]!.querySelector("button"))
        .toBeNull();
    } finally {
      view.destroy();
    }
  });

  it("inserts <JOIN> into the phrase when the button is clicked", async () => {
    const view = createEditor("ab=>cd");
    try {
      await expect
        .poll(() => widgets(view)[0]?.querySelector("button"))
        .not.toBeNull();
      const button = widgets(view)[0]!.querySelector("button")!;

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      await expect.poll(() => view.state.doc.toString()).toBe("ab=><JOIN>cd");
      expect(view.state.selection.main.anchor).toBe(10);
    } finally {
      view.destroy();
    }
  });

  it("ignores clicks on the plain join glyph", async () => {
    const view = createEditor("ab=><JOIN>c");
    try {
      await expect.poll(() => widgets(view).length).toBe(1);
      widgets(view)[0]!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
      // give any (hypothetical) dispatch a chance to land
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(view.state.doc.toString()).toBe("ab=><JOIN>c");
    } finally {
      view.destroy();
    }
  });
});
