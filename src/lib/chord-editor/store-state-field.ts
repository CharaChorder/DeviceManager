import { StateEffect, StateField } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { get, type Readable } from "svelte/store";

export function reactiveStateField<T>(store: Readable<T>) {
  const effect = StateEffect.define<T>();
  const field = StateField.define<T>({
    create() {
      return get(store);
    },
    update(value, transaction) {
      return (
        transaction.effects.findLast((it) => it.is(effect))?.value ?? value
      );
    },
  });
  const plugin = ViewPlugin.fromClass(
    class {
      unsubscribe: () => void;

      constructor(readonly view: EditorView) {
        this.unsubscribe = store.subscribe((value) => {
          setTimeout(() => {
            view.dispatch({ effects: effect.of(value) });
          });
        });
      }

      destroy() {
        this.unsubscribe();
      }
    },
  );
  return { field, plugin: [field, plugin] };
}
