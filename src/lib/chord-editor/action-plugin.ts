import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { mount, unmount } from "svelte";
import Action from "$lib/components/Action.svelte";
import { syntaxTree } from "@codemirror/language";
import type { Range } from "@codemirror/state";

export class ActionWidget extends WidgetType {
  component?: {};

  constructor(readonly id: string | number) {
    super();
    this.id = id;
  }

  /*override eq(other: ActionWidget) {
    return this.id == other.id;
  }*/

  toDOM() {
    if (this.component) {
      unmount(this.component);
    }
    const element = document.createElement("span");
    element.style.paddingInline = "2px";

    this.component = mount(Action, {
      target: element,
      props: { action: this.id, display: "keys", inText: true },
    });
    return element;
  }

  override ignoreEvent() {
    return true;
  }

  override destroy() {
    if (this.component) {
      unmount(this.component);
    }
  }
}

function actionWidgets(view: EditorView) {
  const widgets: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name !== "ExplicitAction") return;
        const value =
          node.node.getChild("ActionId") ?? node.node.getChild("HexNumber");
        if (!value) return;
        if (!node.node.getChild("ExplicitDelimEnd")) {
          return;
        }
        const id = view.state.doc.sliceString(value.from, value.to);
        if (value.name === "HexNumber" && id.length === 10) return;
        let deco = Decoration.replace({
          widget: new ActionWidget(
            value.name === "ActionId" ? id : Number.parseInt(id, 16),
          ),
        });
        widgets.push(deco.range(node.from, node.to));
      },
    });
  }
  return Decoration.set(widgets);
}

export const actionPlugin = ViewPlugin.fromClass(
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
