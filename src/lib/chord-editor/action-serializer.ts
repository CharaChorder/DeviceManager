import { KEYMAP_CODES, type KeyInfo } from "$lib/serial/keymap-codes";
import type { CharaChordFile } from "$lib/share/chara-file";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import { get } from "svelte/store";
import {
  composeChordInput,
  hasConcatenator,
  hashChord,
  willBeValidChordInput,
} from "$lib/serial/chord";
import type {
  ActionMeta,
  ChordMeta,
  MetaRange,
  ParseResult,
} from "./parse-meta";

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

export function parseChordMeta(
  data: EditorState,
  ids: Map<string, KeyInfo>,
  codes: Map<number, KeyInfo>,
): ChordMeta[] {
  console.time("parseChordTree");
  const result: ChordMeta[] = [];

  let current: ChordMeta = { range: [0, 0], valid: false };
  let actions: ActionMeta[] = [];
  let actionRange: MetaRange | undefined = undefined;

  syntaxTree(data)
    .cursor()
    .iterate(
      (node) => {
        if (node.name === "Action") {
          actionRange = [node.from, node.to];
        } else if (node.name === "ChordPhrase") {
          current.phrase = {
            range: [node.from, node.to],
            value: [],
            valid: true,
            actions: [],
            hasConcatenator: false,
          };
        } else if (node.name === "Chord") {
          current = { range: [node.from, node.to], valid: false };
        } else if (node.name === "ActionString") {
          actions = [];
        } else if (node.name === "HexNumber") {
          const hexString = data.doc.sliceString(node.from, node.to);
          const code = Number.parseInt(hexString, 16);
          const parentNode = node.node.parent;
          if (parentNode?.type.name === "CompoundLiteral") {
            current.compounds ??= [];
            current.compounds.push({
              range: [parentNode.from, parentNode.to],
              value: code,
              actions: [],
              valid: true, // TODO: validate compound literal
            });
          } else {
            const valid = !(Number.isNaN(code) || code < 0 || code > 1023);
            actions.push({
              code,
              info: codes.get(code),
              explicit: true,
              valid,
              range: actionRange!,
            });
          }
        } else if (
          node.name === "ActionId" ||
          node.name === "SingleLetter" ||
          node.name === "EscapedLetter"
        ) {
          const id = data.doc.sliceString(node.from, node.to);
          const info = ids.get(id);
          const value: ActionMeta = {
            code: info?.code ?? Number.NaN,
            info,
            valid: info !== undefined,
            range: actionRange!,
          };
          if (node.name === "ActionId") {
            value.explicit = true;
          }
          actions.push(value);
        }
      },
      (node) => {
        if (node.name === "Chord") {
          result.push(current);
          if (current.phrase) {
            current.phrase.actions = actions;
            current.phrase.value = actions.map(({ code }) => code);
            current.phrase.valid = actions.every(({ valid }) => valid);
            current.phrase.hasConcatenator = hasConcatenator(
              current.phrase.value,
              codes,
            );
          }
          current.valid =
            (current.phrase?.valid ?? false) && (current.input?.valid ?? false);
          if (!current.valid) {
            current.disabled = true;
          }
        } else if (node.name === "CompoundInput") {
          const lastCompound = current.compounds?.at(-1);
          current.compounds ??= [];
          current.compounds.push({
            range: [node.from, node.to],
            value: hashChord(
              composeChordInput(
                actions.map(({ code }) => code),
                lastCompound?.value,
              ),
            ),
            actions,
            valid:
              willBeValidChordInput(
                actions.length,
                lastCompound !== undefined,
              ) && actions.every(({ valid }) => valid),
          });
        } else if (node.name === "ChordInput") {
          const lastCompound = current.compounds?.at(-1);
          current.input = {
            range: [node.from, node.to],
            value: composeChordInput(
              actions.map(({ code }) => code),
              lastCompound?.value,
            ),
            valid:
              willBeValidChordInput(
                actions.length,
                lastCompound !== undefined,
              ) && actions.every(({ valid }) => valid),
            actions,
          };
        }
      },
    );

  console.timeEnd("parseChordTree");
  return result;
}

function resolveChordOverrides(chords: ChordMeta[]) {
  console.time("resolveOverrides");
  const seen = new Map<string, ChordMeta>();
  for (const info of chords) {
    if (!info.input || info.disabled) continue;
    const key = JSON.stringify(info.input.value);
    const override = seen.get(key);
    if (override) {
      override.overrides ??= [];
      override.overrides.push(info);
      info.overriddenBy = override;
      info.disabled = true;
    } else {
      seen.set(key, info);
    }
  }
  console.timeEnd("resolveOverrides");
}

function resolveChordAliases(chords: ChordMeta[]) {
  console.time("resolveAliases");
  const aliases = new Map<string, ChordMeta[]>();
  for (const info of chords) {
    if (!info.phrase) continue;
    const key = JSON.stringify(info.phrase.value);
    const list = aliases.get(key) ?? [];
    list.push(info);
    aliases.set(key, list);
  }
  for (const aliasList of aliases.values()) {
    if (aliasList.length > 1) {
      for (const info of aliasList) {
        info.aliases = aliasList.filter((i) => i !== info);
      }
    }
  }
  console.timeEnd("resolveAliases");
}

function resolveCompoundParents(chords: ChordMeta[]) {
  console.time("resolveCompoundParents");
  const compounds = new Map<number, ChordMeta>();
  for (const chord of chords) {
    if (chord.input && !chord.disabled) {
      compounds.set(hashChord(chord.input.value), chord);
    }
  }
  for (const chord of chords) {
    if (chord.compounds) {
      for (const compound of chord.compounds) {
        const parent = compounds.get(compound.value);
        if (parent) {
          compound.parent = parent;
        }
      }
      const lastCompound = chord.compounds?.at(-1);
      if (lastCompound && lastCompound.parent) {
        lastCompound.parent.children ??= [];
        lastCompound.parent.children.push(chord);
      }
    }
  }
  console.timeEnd("resolveCompoundParents");
}

export function parseCharaChords(
  data: EditorState,
  ids: Map<string, KeyInfo>,
  codes: Map<number, KeyInfo>,
  deviceChords: CharaChordFile["chords"],
): ParseResult {
  console.time("parseTotal");

  const chords = parseChordMeta(data, ids, codes);
  resolveChordOverrides(chords);
  resolveChordAliases(chords);
  resolveCompoundParents(chords);

  /*for (let i = 0; i < metas.length; i++) {
    const [, compound] = splitCompound(chords[i]![0]);
    if (
      compound !== undefined &&
      (!compoundInputs.has(compound) || orphanCompounds.has(compound))
    ) {
      metas[i]!.orphan = true;
    }
  }

  const removed: CharaChordFile["chords"] = [];
  for (let deviceChord of deviceChords) {
    const key = JSON.stringify(deviceChord[0]);
    if (!keys.has(key)) {
      removed.push(deviceChord);
    } else {
      const index = keys.get(key)!;
      const meta = metas[index]!;
      if (
        JSON.stringify(deviceChord[1]) !==
        JSON.stringify(chords[keys.get(key)!]![1])
      ) {
        meta.originalPhrase = deviceChord[1];
      } else {
        meta.unchanged = true;
      }
    }
  }*/

  console.timeEnd("parseTotal");

  console.log(chords);
  return { chords, removed: [] };
}
