import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { Range } from "@codemirror/state";
import type { SyntaxNodeRef } from "@lezer/common";

export class DelimWidget extends WidgetType {
  constructor() {
    super();
  }

  toDOM() {
    const element = document.createElement("div");
    element.style.breakAfter = "column";
    return element;
  }
}

function delimWidgets(view: EditorView): {
  delims: DecorationSet;
  surrounding: DecorationSet;
} {
  const delims: Range<Decoration>[] = [];
  const surrounding: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    let chord: { from: number; to: number } | null = null;
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        console.log(node.name, node.from, node.to);
        if (node.name === "Chord") {
          chord = { from: node.from, to: node.to };
        }
        if (node.name !== "PhraseDelim" || chord === null) return;

        delims.push(
          Decoration.mark({
            class: "chord-delim",
          }).range(node.from, node.to),
        );

        if (chord.from < node.from) {
          surrounding.push(
            Decoration.mark({
              tagName: "div",
              class: "chord-input",
            }).range(chord.from, node.from),
          );
        }
        if (chord.to > node.to) {
          surrounding.push(
            Decoration.mark({
              tagName: "div",
              class: "chord-phrase",
            }).range(node.to, chord.to),
          );
        }
        chord = null;
      },
    });
  }
  return {
    delims: Decoration.set(delims),
    surrounding: Decoration.set([...surrounding, ...delims], true),
  };
}

export const delimPlugin = ViewPlugin.fromClass(
  class {
    delims = Decoration.none;
    surrounding = Decoration.none;

    constructor(view: EditorView) {
      const { delims, surrounding } = delimWidgets(view);
      this.delims = delims;
      this.surrounding = surrounding;
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) != syntaxTree(update.state)
      ) {
        const { delims, surrounding } = delimWidgets(update.view);
        this.delims = delims;
        this.surrounding = surrounding;
      }
    }
  },
  {
    decorations(instance) {
      return instance.delims;
    },
    provide(plugin) {
      return EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.delims ?? Decoration.none,
      );
    },
  },
);
