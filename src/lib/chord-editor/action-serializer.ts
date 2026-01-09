import type { KeyInfo } from "$lib/serial/keymap-codes";
import type { CharaChordFile } from "$lib/share/chara-file";
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
import type { Tree } from "@lezer/common";

function parseChordMeta(
  tree: Tree,
  ids: Map<string, KeyInfo>,
  codes: Map<number, KeyInfo>,
  sliceString: (from: number, to: number) => string,
): ChordMeta[] {
  console.time("parseChordTree");
  const result: ChordMeta[] = [];

  let current: ChordMeta = { range: [0, 0], valid: false };
  let actions: ActionMeta[] = [];
  let actionRange: MetaRange | undefined = undefined;

  tree.cursor().iterate(
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
        const hexString = sliceString(node.from, node.to);
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
        const id = sliceString(node.from, node.to);
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
            willBeValidChordInput(actions.length, lastCompound !== undefined) &&
            actions.every(({ valid }) => valid),
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
            willBeValidChordInput(actions.length, lastCompound !== undefined) &&
            actions.every(({ valid }) => valid),
          actions,
        };
      }
    },
  );

  console.timeEnd("parseChordTree");
  return result;
}

function resolveChordOverrides(chords: ChordMeta[]): Map<string, ChordMeta> {
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
  return seen;
}

function resolveChordAliases(chords: ChordMeta[]): Map<string, ChordMeta[]> {
  console.time("resolveAliases");
  const aliases = new Map<string, ChordMeta[]>();
  for (const info of chords) {
    if (!info.phrase) continue;
    const key = JSON.stringify(info.phrase.value);
    const list = aliases.get(key) ?? [];
    list.push(info);
    aliases.set(key, list);
  }
  for (const [key, value] of aliases) {
    if (value.length <= 1) {
      aliases.delete(key);
    } else {
      for (const info of value) {
        info.aliases = value.filter((i) => i !== info);
      }
    }
  }
  console.timeEnd("resolveAliases");
  return aliases;
}

function resolveCompoundParents(chords: ChordMeta[]): Map<number, ChordMeta> {
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
  return compounds;
}

export function resolveChanges(
  chords: ChordMeta[],
  inputs: Map<string, ChordMeta>,
  deviceChords: CharaChordFile["chords"],
): [CharaChordFile["chords"], Map<string, ChordMeta>] {
  console.time("resolveChanges");
  const removed: CharaChordFile["chords"] = [];
  const exact = new Map<string, ChordMeta>();
  for (const chord of chords) {
    if (chord.input && chord.phrase && !chord.disabled) {
      exact.set(
        JSON.stringify([chord.input.value, chord.phrase?.value ?? []]),
        chord,
      );
    }
  }
  for (const deviceChord of deviceChords) {
    const exactMatch = exact.get(JSON.stringify(deviceChord));
    if (exactMatch) {
      exactMatch.phrase!.originalValue = exactMatch.phrase!.value;
      continue;
    }
    const byInput = inputs.get(JSON.stringify(deviceChord[0]));
    if (byInput) {
      byInput.phrase!.originalValue = deviceChord[1];
      continue;
    }
    removed.push(deviceChord);
  }

  console.timeEnd("resolveChanges");
  return [removed, exact];
}

export function parseCharaChords(
  tree: Tree,
  ids: Map<string, KeyInfo>,
  codes: Map<number, KeyInfo>,
  deviceChords: CharaChordFile["chords"],
  sliceString: (from: number, to: number) => string,
): ParseResult {
  console.time("parseTotal");

  const chords = parseChordMeta(tree, ids, codes, sliceString);
  const inputs = resolveChordOverrides(chords);
  const aliases = resolveChordAliases(chords);
  const compounds = resolveCompoundParents(chords);
  const [removed, exact] = resolveChanges(chords, inputs, deviceChords);

  console.timeEnd("parseTotal");

  return { chords, removed, aliases, compounds, inputs, exact };
}
