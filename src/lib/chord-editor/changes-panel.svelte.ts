import { EditorView, showPanel, type Panel } from "@codemirror/view";
import { parsedChordsField } from "./parsed-chords-plugin";
import { mount, unmount } from "svelte";
import ChangesPanel from "./ChangesPanel.svelte";

function changesPanelFunc(view: EditorView): Panel {
  let dom = document.createElement("div");
  dom.style.display = "contents";
  let viewState = $state.raw(view);
  let parsed = $state.raw(view.state.field(parsedChordsField));
  let component: {};
  return {
    dom,
    mount() {
      component = mount(ChangesPanel, {
        target: dom,
        props: {
          get parsed() {
            return parsed;
          },
          get view() {
            return viewState;
          },
        },
      });
    },
    update: (update) => {
      if (
        update.startState.field(parsedChordsField) !==
        update.state.field(parsedChordsField)
      ) {
        console.log("update changes panel");
        parsed = update.state.field(parsedChordsField);
      }
    },
    destroy() {
      unmount(component);
    },
  };
}

export function changesPanel() {
  return showPanel.of(changesPanelFunc);
}
