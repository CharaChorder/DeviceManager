import {
  ChangeDesc,
  StateEffect,
  StateField,
  type Extension,
} from "@codemirror/state";
import { parseCharaChords, type ParseResult } from "./action-serializer";
import { type KeyInfo } from "$lib/serial/keymap-codes";
import { actionMetaPlugin } from "./action-meta-plugin";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import type { Tree } from "@lezer/common";
import { syntaxParserRunning, syntaxTree } from "@codemirror/language";
import { debounceTime, Subject } from "rxjs";
import { forceLinting } from "@codemirror/lint";

function mapParseResult(value: ParseResult, change: ChangeDesc): ParseResult {
  if (change.empty) return value;
  if (
    value.meta.every(
      (it) =>
        change.mapPos(it.to) === it.to && change.mapPos(it.from) === it.from,
    )
  )
    return value;
  return {
    result: value.result,
    meta: value.meta.map((it) => ({
      ...it,
      from: change.mapPos(it.from),
      to: change.mapPos(it.to),
    })),
    compoundInputs: value.compoundInputs,
  };
}

export const parsedChordsEffect = StateEffect.define<ParseResult>({
  map: mapParseResult,
});

export const parsedChordsField = StateField.define<ParseResult>({
  create() {
    return { compoundInputs: new Map(), meta: [], result: [] };
  },
  update(value, transaction) {
    return (
      transaction.effects.findLast((it) => it.is(parsedChordsEffect))?.value ??
      mapParseResult(value, transaction.changes)
    );
  },
});

export function parsedChordsPlugin(debounce = 200): Extension {
  const plugin = ViewPlugin.fromClass(
    class {
      tree: Tree;
      ids: Map<string, KeyInfo>;
      codes: Map<number, KeyInfo>;

      needsUpdate = new Subject<void>();
      subscription = this.needsUpdate
        .pipe(debounceTime(debounce))
        .subscribe(() => {
          if (syntaxParserRunning(this.view)) {
            this.needsUpdate.next();
            return;
          }
          requestIdleCallback(() => {
            this.view.dispatch({
              effects: parsedChordsEffect.of(
                parseCharaChords(this.view.state, this.ids, this.codes),
              ),
            });
            forceLinting(this.view);
          });
        });

      constructor(readonly view: EditorView) {
        this.tree = syntaxTree(view.state);
        this.ids = view.state.field(actionMetaPlugin.field).ids;
        this.codes = view.state.field(actionMetaPlugin.field).codes;
        this.needsUpdate.next();
      }

      update(update: ViewUpdate) {
        const tree = syntaxTree(update.state);
        const ids = update.state.field(actionMetaPlugin.field).ids;
        const codes = update.state.field(actionMetaPlugin.field).codes;
        if (tree !== this.tree || ids !== this.ids || codes !== this.codes) {
          this.tree = tree;
          this.ids = ids;
          this.codes = codes;
          this.needsUpdate.next();
        }
      }

      destroy() {
        this.subscription.unsubscribe();
      }
    },
  );
  return [parsedChordsField, plugin];
}
