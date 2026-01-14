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
import { debounceTime, mergeMap, Subject } from "rxjs";
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
import { parsedChordsField } from "./parsed-chords-plugin";
import { changesPanel } from "./changes-panel";
import {
  parseCompressed,
  stringifyCompressed,
} from "$lib/serial/serialization";

const serializedFields = {
  history: historyField,
  deviceChords: deviceChordField,
};

export interface EditorConfig {
  rawCode?: boolean;
  storeName: string;
  autocomplete(query: string | undefined): void;
}

export async function loadPersistentState(
  params: EditorConfig,
): Promise<EditorState> {
  const stored = localStorage.getItem(params.storeName);
  const config = {
    extensions: [
      actionMetaPlugin.plugin,
      deviceChordField,
      parsedChordsField,
      changesPanel(),
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
      const parsed = await parseCompressed(new Blob([stored]));
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
        .pipe(
          debounceTime(500),
          mergeMap(() =>
            stringifyCompressed(this.view.state.toJSON(serializedFields)),
          ),
          mergeMap((blob) => blob.text()),
        )
        .subscribe((value) => {
          localStorage.setItem(storeName, value);
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
