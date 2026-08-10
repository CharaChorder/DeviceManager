import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  type PluginValue,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

export function actionAutocompletePlugin(
  query: (query: string | undefined) => void,
) {
  return ViewPlugin.fromClass(
    class implements PluginValue {
      constructor(readonly view: EditorView) {}

      update(update: ViewUpdate) {
        query(this.resolveAutocomplete(update.state));
      }

      resolveAutocomplete(state: EditorState): string | undefined {
        if (state.selection.ranges.length !== 1) return;
        const from = state.selection.ranges[0]!.from;
        const to = state.selection.ranges[0]!.to;
        if (from !== to) return;
        const tree = syntaxTree(state);
        const node = tree.resolveInner(from, -1).parent;
        if (node?.name !== "ExplicitAction") return;
        if (node.getChild("ExplicitDelimEnd")) return;
        const queryNode = node.getChild("ExplicitDelimStart")?.nextSibling;
        return (
          (queryNode
            ? state.doc.sliceString(queryNode.from, queryNode.to)
            : undefined) || undefined
        );
      }
    },
  );
}
