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
import { changesPanel } from "./changes-panel.svelte";
import { searchKeymap } from "@codemirror/search";

const serializedFields = {
  history: historyField,
  deviceChords: deviceChordField,
};

export interface EditorConfig {
  rawCode?: boolean;
  storeName: string;
  autocomplete(query: string | undefined): void;
}

export function createConfig(params: EditorConfig) {
  return {
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
      keymap.of([...standardKeymap, ...historyKeymap, ...searchKeymap]),
    ],
  } satisfies EditorStateConfig;
}

export async function loadPersistentState(
  params: EditorConfig,
): Promise<EditorState> {
  const stored = await getState(params.storeName);
  const config = createConfig(params);

  if (stored) {
    try {
      return EditorState.fromJSON(stored, config, serializedFields);
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
            storeState(storeName, this.view.state.toJSON(serializedFields)),
          ),
        )
        .subscribe(() => {});

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

const dbName = "chord-state";
const dbVersion = 1;
const storeName = "state";

async function openDb(): Promise<IDBDatabase> {
  const dbRequest = indexedDB.open(dbName, dbVersion);
  return new Promise<IDBDatabase>((resolve, reject) => {
    dbRequest.onsuccess = () => resolve(dbRequest.result);
    dbRequest.onerror = () => reject(dbRequest.error);
    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
}

async function getState<T>(name: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    const readTransaction = db.transaction([storeName], "readonly");
    const store = readTransaction.objectStore(storeName);
    const itemRequest = store.get(name);
    const result = await new Promise<T | undefined>((resolve) => {
      itemRequest.onsuccess = () => resolve(itemRequest.result);
      itemRequest.onerror = () => resolve(undefined);
    });
    return result;
  } catch (e) {
    console.error(e);
    return undefined;
  } finally {
    db.close();
  }
}

async function storeState<T>(name: string, state: T): Promise<void> {
  const db = await openDb();
  try {
    const putTransaction = db.transaction([storeName], "readwrite");
    const putStore = putTransaction.objectStore(storeName);
    const putRequest = putStore.put(state, name);
    await new Promise<void>((resolve, reject) => {
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
    putTransaction.commit();
  } catch (e) {
    console.error(e);
  } finally {
    db.close();
  }
}
