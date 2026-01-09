import {
  KEYMAP_CODES,
  KEYMAP_IDS,
  type KeyInfo,
} from "$lib/serial/keymap-codes";
import type { CharaChordFile } from "$lib/share/chara-file";
import { syntaxTree } from "@codemirror/language";
import { StateEffect, ChangeDesc, type EditorState } from "@codemirror/state";
import type { Update } from "@codemirror/collab";
import { get } from "svelte/store";
import {
  composeChordInput,
  hashChord,
  splitCompound,
  willBeValidChordInput,
} from "$lib/serial/chord";
import type { SyntaxNodeRef } from "@lezer/common";

export function canUseIdAsString(info: KeyInfo): boolean {
  return !!info.id && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(info.id);
}

export function actionToValue(action: number | KeyInfo) {
  const info =
    typeof action === "number" ? get(KEYMAP_CODES).get(action) : action;
  if (info && info.id?.length === 1)
    return /^[<>|\\\s]$/.test(info.id) ? `\\${info.id}` : info.id;
  if (!info || !canUseIdAsString(info))
    return `<0x${(info?.code ?? action).toString(16).padStart(2, "0")}>`;
  return `<${info.id}>`;
}

export interface ParseMeta {
  from: number;
  to: number;
  invalidActions?: true;
  invalidInput?: true;
  emptyPhrase?: true;
  orphan?: true;
  disabled?: true;
  overrides?: number[];
  overriddenBy?: number;
}

export interface ParseResult {
  result: CharaChordFile["chords"];
  meta: ParseMeta[];
  compoundInputs: Map<number, string>;
}

export function parseCharaChords(
  data: EditorState,
  ids: Map<string, KeyInfo>,
): ParseResult {
  const chords: CharaChordFile["chords"] = [];
  const metas: ParseMeta[] = [];
  const keys = new Map<string, number>();
  const compoundInputs = new Map<number, string>();

  let currentChord: CharaChordFile["chords"][number] | undefined = undefined;
  let compound: number | undefined = undefined;
  let currentActions: number[] = [];
  let invalidActions = false;
  let invalidInput = false;
  let chordFrom = 0;

  function makeChordInput(node: SyntaxNodeRef): number[] {
    invalidInput ||= !willBeValidChordInput(currentActions.length, !!compound);
    const input = composeChordInput(currentActions, compound);
    compound = hashChord(input);
    if (!compoundInputs.has(compound)) {
      compoundInputs.set(compound, data.doc.sliceString(chordFrom, node.from));
    }
    return input;
  }

  syntaxTree(data)
    .cursor()
    .iterate(
      (node) => {
        if (node.name === "Chord") {
          currentChord = undefined;
          compound = undefined;
          invalidActions = false;
          invalidInput = false;
          chordFrom = node.from;
        } else if (node.name === "ActionString") {
          currentActions = [];
        } else if (node.name === "HexNumber") {
          const hexString = data.doc.sliceString(node.from, node.to);
          const code = Number.parseInt(hexString, 16);
          if (hexString.length === 10) {
            if (compound !== undefined) {
              invalidInput = true;
            }
            compound = code;
          } else {
            if (Number.isNaN(code) || code < 0 || code > 1023) {
              invalidActions = true;
            }
            currentActions.push(code);
          }
        } else if (
          node.name === "ActionId" ||
          node.name === "SingleLetter" ||
          node.name === "EscapedChar"
        ) {
          const id = data.doc.sliceString(node.from, node.to);
          const code = ids.get(id)?.code;
          if (code === undefined) {
            invalidActions = true;
            const encoder = new TextEncoder();
            const bytes = encoder.encode(id);
            for (let byte of bytes) {
              currentActions.push(-byte);
            }
          } else {
            currentActions.push(code);
          }
        }
      },
      (node) => {
        if (node.name === "Chord" && currentChord !== undefined) {
          if (currentChord !== undefined) {
            currentChord[1] = currentActions;
            const index = chords.length;
            chords.push(currentChord);
            const meta: ParseMeta = { from: node.from, to: node.to };
            if (invalidActions) {
              meta.invalidActions = true;
            }
            if (invalidInput) {
              meta.invalidInput = true;
            }
            metas.push(meta);
            if (currentChord[1].length === 0) {
              meta.emptyPhrase = true;
            }
            const key = JSON.stringify(currentChord[0]);
            if (!meta.invalidInput) {
              if (keys.has(key)) {
                const targetIndex = keys.get(key)!;
                const targetMeta = metas[targetIndex]!;
                if (!targetMeta.overrides) targetMeta.overrides = [];
                targetMeta.overrides.push(index);
                meta.overriddenBy = targetIndex;
              } else {
                keys.set(key, index);
              }
            }
            if (
              meta.emptyPhrase ||
              meta.invalidInput ||
              meta.invalidActions ||
              meta.overriddenBy !== undefined
            ) {
              meta.disabled = true;
            }
          }
        } else if (node.name === "CompoundDelim") {
          makeChordInput(node);
        } else if (node.name === "PhraseDelim") {
          const input = makeChordInput(node);
          currentChord = [composeChordInput(input, compound), []];
        }
      },
    );

  for (let i = 0; i < metas.length; i++) {
    const [, compound] = splitCompound(chords[i]![0]);
    if (compound !== undefined && !compoundInputs.has(compound)) {
      metas[i]!.orphan = true;
    }
  }

  return { result: chords, meta: metas, compoundInputs };
}

class ChordRecord {
  private chords = new Map<string, Set<string>>();

  constructor(chords: CharaChordFile["chords"]) {
    for (let chord of chords) {
      const key = JSON.stringify(chord[0]);
      if (!this.chords.has(key)) {
        this.chords.set(key, new Set());
      }
      this.chords.get(key)!.add(JSON.stringify(chord));
    }
  }

  static createDiff(
    previous: CharaChordFile["chords"],
    updated: CharaChordFile["chords"],
  ) {
    const deleted = new ChordRecord(previous);
    const added = new ChordRecord(updated);
    const dupA = deleted.duplicates(added);
    const dupB = added.duplicates(deleted);
    for (let chord of dupA) {
      deleted.remove(chord);
      added.remove(chord);
    }
    for (let chord of dupB) {
      deleted.remove(chord);
      added.remove(chord);
    }
    return { deleted, added };
  }

  duplicates(
    other: ChordRecord,
  ): IteratorObject<CharaChordFile["chords"][number]> {
    const duplicates = new Set<string>();
    for (let [key, chordSet] of this.chords) {
      for (let chord of chordSet) {
        if (other.hasInternal(key, chord)) {
          duplicates.add(chord);
        }
      }
    }
    return duplicates
      .values()
      .map((it) => JSON.parse(it) as CharaChordFile["chords"][number]);
  }

  private hasInternal(key: string, chord: string): boolean {
    return this.chords.get(key)?.has(chord) ?? false;
  }

  has(chord: CharaChordFile["chords"][number]): boolean {
    return this.hasInternal(JSON.stringify(chord[0]), JSON.stringify(chord));
  }

  remove(chord: CharaChordFile["chords"][number]) {
    const key = JSON.stringify(chord[0]);
    const set = this.chords.get(key);
    if (set) {
      set.delete(JSON.stringify(chord));
      if (set.size === 0) {
        this.chords.delete(key);
      }
    }
  }
}

export function syncChords(
  previous: CharaChordFile["chords"],
  updated: CharaChordFile["chords"],
  state: EditorState,
) {
  const deviceDiff = ChordRecord.createDiff(previous, updated);
  const current = parseCharaChords(state, get(KEYMAP_IDS));
  // save initial device chords
  // compare new device chords with initial device chords
  // take changed/new/removed chords
  // compare current editor chords with initial device chords
  // compare two change sets
  // apply removals if the chord didn't change on either end
  // apply
}

export function rebaseUpdates(
  updates: readonly Update[],
  over: readonly { changes: ChangeDesc; clientID: string }[],
) {
  if (!over.length || !updates.length) return updates;
  let changes: ChangeDesc | null = null,
    skip = 0;
  for (let update of over) {
    let other = skip < updates.length ? updates[skip] : null;
    if (other && other.clientID == update.clientID) {
      if (changes) changes = changes.mapDesc(other.changes, true);
      skip++;
    } else {
      changes = changes ? changes.composeDesc(update.changes) : update.changes;
    }
  }

  if (skip) updates = updates.slice(skip);
  return !changes
    ? updates
    : updates.map((update) => {
        let updateChanges = update.changes.map(changes!);
        changes = changes!.mapDesc(update.changes, true);
        return {
          changes: updateChanges,
          effects:
            update.effects && StateEffect.mapEffects(update.effects, changes!),
          clientID: update.clientID,
        };
      });
}
