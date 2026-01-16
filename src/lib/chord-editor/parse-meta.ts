import type { KeyInfo } from "$lib/serial/keymap-codes";
import type { CharaChordFile } from "$lib/share/chara-file";
import type { ChangeDesc } from "@codemirror/state";

export type MetaRange = [from: number, to: number];

function mapMetaRange(range: MetaRange, change: ChangeDesc): MetaRange {
  const newFrom = change.mapPos(range[0]);
  const newTo = change.mapPos(range[1]);
  if (newFrom === range[0] && newTo === range[1]) {
    return range;
  }
  return [newFrom, newTo];
}

export interface ActionMeta {
  code: number;
  info?: KeyInfo;
  explicit?: boolean;
  range: MetaRange;
  valid: boolean;
}

function mapActionMeta(action: ActionMeta, change: ChangeDesc): ActionMeta {
  const newRange = mapMetaRange(action.range, change);
  if (newRange === action.range) {
    return action;
  }
  return {
    ...action,
    range: newRange,
  };
}

function mapArray<T>(
  array: T[],
  change: ChangeDesc,
  mapFn: (action: T, change: ChangeDesc) => T,
): T[] {
  let changed = false;
  const newArray = array.map((value) => {
    const newValue = mapFn(value, change);
    if (newValue !== value) {
      changed = true;
      return newValue;
    }
    return value;
  });
  if (changed) {
    return newArray;
  }
  return array;
}

export interface ActionStringMeta<T> {
  range: MetaRange;
  value: T;
  valid: boolean;
  actions: ActionMeta[];
}

function mapActionStringMeta<T extends ActionStringMeta<unknown>>(
  actionString: T,
  change: ChangeDesc,
) {
  const newRange = mapMetaRange(actionString.range, change);
  const newActions = mapArray(actionString.actions, change, mapActionMeta);
  if (newRange === actionString.range && newActions === actionString.actions) {
    return actionString;
  }
  return {
    ...actionString,
    range: newRange,
    actions: newActions,
  };
}

export interface PhraseMeta extends ActionStringMeta<number[]> {
  hasConcatenator: boolean;
  originalValue?: number[];
}

export interface CompoundMeta extends ActionStringMeta<number> {
  parent?: ChordMeta;
}

export interface InputMeta extends ActionStringMeta<number[]> {}

export interface ChordMeta {
  range: MetaRange;
  valid: boolean;
  disabled?: boolean;
  compounds?: CompoundMeta[];
  input?: InputMeta;
  phrase?: PhraseMeta;
  children?: ChordMeta[];
  overrides?: ChordMeta[];
  aliases?: ChordMeta[];
  overriddenBy?: ChordMeta;
}

export function mapChordMeta(chord: ChordMeta, change: ChangeDesc): ChordMeta {
  const newRange = mapMetaRange(chord.range, change);
  const newCompounds = chord.compounds
    ? mapArray(chord.compounds, change, mapActionStringMeta)
    : undefined;
  const newInput = chord.input
    ? mapActionStringMeta(chord.input, change)
    : undefined;
  const newPhrase = chord.phrase
    ? mapActionStringMeta(chord.phrase, change)
    : undefined;
  if (
    newRange === chord.range &&
    newCompounds === chord.compounds &&
    newInput === chord.input &&
    newPhrase === chord.phrase
  ) {
    return chord;
  }

  const newChord: ChordMeta = {
    ...chord,
    range: newRange,
  };
  if (newCompounds) newChord.compounds = newCompounds;
  if (newInput) newChord.input = newInput;
  if (newPhrase) newChord.phrase = newPhrase;
  return newChord;
}

export interface ParseResult {
  chords: ChordMeta[];
  removed: CharaChordFile["chords"];
  aliases: Map<string, ChordMeta[]>;
  compounds: Map<number, ChordMeta>;
  inputs: Map<string, ChordMeta>;
  exact: Map<string, ChordMeta>;
}

export function mapParseResult(
  result: ParseResult,
  change: ChangeDesc,
): ParseResult {
  const newChords = mapArray(result.chords, change, mapChordMeta);
  if (newChords === result.chords) {
    return result;
  }
  return {
    ...result,
    chords: newChords,
  };
}

export function iterActions(
  chord: ChordMeta,
  callback: (action: ActionMeta) => void,
) {
  if (chord.input) {
    for (const action of chord.input.actions) {
      callback(action);
    }
  }
  if (chord.compounds) {
    for (const compound of chord.compounds) {
      for (const action of compound.actions) {
        callback(action);
      }
    }
  }
  if (chord.phrase) {
    for (const action of chord.phrase.actions) {
      callback(action);
    }
  }
}
