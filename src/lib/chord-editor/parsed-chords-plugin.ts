import { StateField } from "@codemirror/state";
import { parseCharaChords } from "./action-serializer";
import { actionMetaPlugin } from "./action-meta-plugin";
import { syntaxTree } from "@codemirror/language";
import { deviceChordField } from "./chord-sync-plugin";
import { mapParseResult, type ParseResult } from "./parse-meta";

export const parsedChordsField = StateField.define<ParseResult>({
  create() {
    return {
      chords: [],
      removed: [],
    };
  },
  update(value, transaction) {
    const tree = syntaxTree(transaction.state);
    const ids = transaction.state.field(actionMetaPlugin.field).ids;
    const codes = transaction.state.field(actionMetaPlugin.field).codes;
    const deviceChords = transaction.state.field(deviceChordField);
    if (
      tree !== syntaxTree(transaction.startState) ||
      ids !== transaction.startState.field(actionMetaPlugin.field).ids ||
      codes !== transaction.startState.field(actionMetaPlugin.field).codes ||
      deviceChords !== transaction.startState.field(deviceChordField)
    ) {
      return parseCharaChords(transaction.state, ids, codes, deviceChords);
    }
    return mapParseResult(value, transaction.changes);
  },
});
