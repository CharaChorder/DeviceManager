import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { mount, unmount } from "svelte";
import Action from "$lib/components/Action.svelte";
import type { Range } from "@codemirror/state";
import { parsedChordsField } from "./parsed-chords-plugin";
import { iterActions } from "./parse-meta";
import type { KeyInfo } from "$lib/serial/keymap-codes";

export class ActionWidget extends WidgetType {
  component?: {};

  constructor(readonly info: KeyInfo) {
    super();
  }

  toDOM() {
    if (this.component) {
      unmount(this.component);
    }
    const element = document.createElement("span");
    element.style.paddingInline = "2px";

    this.component = mount(Action, {
      target: element,
      props: {
        action: this.info,
        display: "keys",
        inText: true,
        withPopover: false,
      },
    });
    return element;
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
    for (const chord of view.state.field(parsedChordsField).chords) {
      if (chord.range[1] < from || chord.range[0] > to) continue;
      iterActions(chord, (action) => {
        if (
          view.state.selection.ranges.some(
            (r) => r.from <= action.range[1] && r.to > action.range[0],
          )
        ) {
          return;
        }
        if (action.info && action.explicit) {
          const deco = Decoration.replace({
            widget: new ActionWidget(action.info),
          });
          widgets.push(deco.range(action.range[0], action.range[1]));
        }
      });
    }
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
        update.selectionSet ||
        update.startState.field(parsedChordsField) !=
          update.state.field(parsedChordsField)
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
