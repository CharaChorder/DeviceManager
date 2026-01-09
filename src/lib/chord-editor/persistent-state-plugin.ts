import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import {
  history,
  historyField,
  historyKeymap,
  standardKeymap,
} from "@codemirror/commands";
import { debounceTime, Subject } from "rxjs";
import { EditorState, type EditorStateConfig } from "@codemirror/state";
import { lintGutter } from "@codemirror/lint";
import {
  chordHighlightStyle,
  chordLanguageSupport,
} from "./chords-grammar-plugin";
import { actionLinter } from "./action-linter";
import { actionAutocompletePlugin } from "./autocomplete";
import { delimPlugin } from "./chord-delim-plugin";
import { actionPlugin } from "./action-plugin";
import { syntaxHighlighting } from "@codemirror/language";
import { deviceChordField } from "./chord-sync-plugin";
import { actionMetaPlugin } from "./action-meta-plugin";
import { parsedChordsPlugin } from "./parsed-chords-plugin";

const serializedFields = {
  history: historyField,
  deviceChords: deviceChordField,
};

export interface EditorConfig {
  rawCode?: boolean;
  storeName: string;
  autocomplete(query: string | undefined): void;
}

export function loadPersistentState(params: EditorConfig): EditorState {
  const stored = localStorage.getItem(params.storeName);
  const config = {
    extensions: [
      actionMetaPlugin.plugin,
      deviceChordField,
      parsedChordsPlugin(),
      lintGutter(),
      params.rawCode ? [lineNumbers()] : [delimPlugin, actionPlugin],
      chordLanguageSupport(),
      actionLinter({
        delay: 100,
        markerFilter(diagnostics) {
          return diagnostics.filter((it) => it.from !== it.to);
        },
      }),
      actionAutocompletePlugin(params.autocomplete),
      persistentStatePlugin(params.storeName),
      history(),
      syntaxHighlighting(chordHighlightStyle),
      highlightActiveLine(),
      EditorView.theme({
        ".cm-line": {
          borderBottom: "1px solid transparent",
          caretColor: "var(--md-sys-color-on-surface)",
        },
        ".cm-scroller": {
          overflow: "auto",
          width: "100%",
          fontFamily: "inherit !important",
          gap: "8px",
        },
        ".cm-content": {
          flex: 1,
        },
        ".cm-cursor": {
          borderColor: "var(--md-sys-color-on-surface)",
        },
      }),
      keymap.of([...standardKeymap, ...historyKeymap]),
    ],
  } satisfies EditorStateConfig;

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return EditorState.fromJSON(parsed, config, serializedFields);
    } catch (e) {
      console.error("Failed to parse persistent state:", e);
    }
  }
  return EditorState.create(config);
}

export function persistentStatePlugin(storeName: string) {
  return ViewPlugin.fromClass(
    class {
      updateSubject = new Subject<void>();
      subscription = this.updateSubject
        .pipe(debounceTime(500))
        .subscribe(() => {
          localStorage.setItem(
            storeName,
            JSON.stringify(this.view.state.toJSON(serializedFields)),
          );
        });

      constructor(readonly view: EditorView) {}

      update(update: ViewUpdate) {
        if (update.state !== update.startState) {
          this.updateSubject.next();
        }
      }

      destroy() {
        this.subscription.unsubscribe();
      }
    },
  );
}
