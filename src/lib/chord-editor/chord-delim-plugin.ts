import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { Range } from "@codemirror/state";
import { mount, unmount } from "svelte";
import Action from "../components/Action.svelte";
import type { SyntaxNodeRef } from "@lezer/common";
import classNames from "./concatenator-button.module.scss";

export class DelimWidget extends WidgetType {
  component?: {};
  element?: HTMLElement;

  constructor(readonly hasConcatenator: boolean) {
    super();
  }

  override eq(other: DelimWidget) {
    return this.hasConcatenator == other.hasConcatenator;
  }

  toDOM() {
    if (!this.element) {
      /*this.element = document.createElement("span");
      this.element.innerHTML =
        "&emsp;⇛" + (this.hasConcatenator ? "" : "&emsp;");
      this.element.style.scale = "1.8";
      this.element.style.color =
        "color-mix(in srgb, currentColor 50%, transparent)";

      if (this.hasConcatenator) {
        const button = document.createElement("button");
        button.className = classNames["concatenator-button"]!;
        this.component = mount(Action, {
          target: button,
          props: { action: 574, display: "keys", inText: true, ghost: true },
        });
        this.element.appendChild(button);
      }*/
      this.element = document.createElement("div");
      this.element.style.breakAfter = "column";
    }
    return this.element;
  }

  override ignoreEvent() {
    return false;
  }

  override destroy() {
    if (this.component) {
      unmount(this.component);
    }
  }
}

function getJoinNode(
  view: EditorView,
  phraseDelimNode: SyntaxNodeRef,
): SyntaxNodeRef | null | undefined {
  const firstPhraseAction = phraseDelimNode.node.nextSibling
    ?.getChild("ActionString")
    ?.node.firstChild?.node.getChild("ExplicitAction");
  const idNode = firstPhraseAction?.node.getChild("ActionId");
  const actionId = idNode
    ? view.state.doc.sliceString(idNode.from, idNode.to)
    : null;
  const isJoinAction =
    actionId === "JOIN" &&
    !!firstPhraseAction!.node.getChild("ExplicitDelimEnd");
  return isJoinAction ? firstPhraseAction : null;
}

function actionWidgets(view: EditorView) {
  const widgets: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name !== "PhraseDelim") return;
        const joinNode = getJoinNode(view, node);

        let deco = Decoration.replace({
          widget: new DelimWidget(!joinNode),
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
    eventHandlers: {
      click: (event, view) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (
          !(
            event.target instanceof HTMLButtonElement ||
            (event.target as HTMLElement).parentElement instanceof
              HTMLButtonElement
          )
        )
          return;

        const chordNode = syntaxTree(view.state).resolve(
          view.posAtDOM(event.target),
        );
        const delimNode = (
          chordNode.name === "ActionString"
            ? chordNode.parent?.parent
            : chordNode
        )?.getChild("PhraseDelim");
        if (!delimNode) return;
        const joinNode = getJoinNode(view, delimNode);
        if (!event.target.checked && !joinNode) {
          view.dispatch({
            changes: {
              from: delimNode.to,
              insert: "<JOIN>",
            },
            selection: { anchor: delimNode.to + "<JOIN>".length },
          });
        }
      },
    },
  },
);
