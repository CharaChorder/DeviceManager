import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  type PluginValue,
} from "@codemirror/view";

export const changesPlugin = ViewPlugin.fromClass(
  class implements PluginValue {
    constructor(readonly view: EditorView) {}

    update(update: ViewUpdate) {}
  },
  {
    eventHandlers: {},
  },
);
