import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { Range } from "@codemirror/state";

export class DelimWidget extends WidgetType {
  constructor() {
    super();
  }

  override eq(other: DelimWidget) {
    return true;
  }

  toDOM() {
    const element = document.createElement("span");
    element.innerHTML = "&emsp;⇛&emsp;";
    element.style.scale = "1.8";
    element.style.opacity = "0.5";
    return element;
  }

  override ignoreEvent() {
    return false;
  }

  override destroy() {}
}

function actionWidgets(view: EditorView) {
  const widgets: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name !== "PhraseDelim") return;
        let deco = Decoration.replace({
          widget: new DelimWidget(),
        });
        widgets.push(deco.range(node.from, node.to));
      },
    });
  }
  return Decoration.set(widgets);
}

export const delimPlugin = ViewPlugin.fromClass(
  class {
    decorations = Decoration.none;

    constructor(view: EditorView) {
      this.decorations = actionWidgets(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) != syntaxTree(update.state)
      )
        this.decorations = actionWidgets(update.view);
    }
  },
  {
    decorations(instance) {
      return instance.decorations;
    },
    provide(plugin) {
      return EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.decorations ?? Decoration.none,
      );
    },
  },
);
