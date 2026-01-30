import type { KeyInfo } from "$lib/serial/keymap-codes";
import { ChangeSet, type ChangeSpec } from "@codemirror/state";
import { parseCharaChords } from "./action-serializer";
import { parser } from "./chords.grammar";
import type { CharaChordFile } from "$lib/share/chara-file";
import { splitCompound } from "$lib/serial/chord";

function canUseIdAsString(info: KeyInfo): boolean {
  return !!info.id && /^[^>\n]+$/.test(info.id);
}

export function actionToValue(code: number, info?: KeyInfo) {
  if (info && info.id?.length === 1)
    return /^[<>|\\\s]$/.test(info.id) ? `\\${info.id}` : info.id;
  if (!info || !canUseIdAsString(info))
    return `<0x${code.toString(16).padStart(2, "0")}>`;
  return `<${info.id}>`;
}

function canonicalInputSorting(input: number[], phrase: number[]): number[] {
  const tail = [...input];
  const prefix = phrase.filter((code) => {
    const index = tail.indexOf(code);
    if (index !== -1) {
      tail.splice(index, 1);
      return true;
    }
    return false;
  });
  return [...prefix, ...tail];
}

export interface ChangeType {
  from: number;
  to: number;
  insert: string;
}

export function syncCharaChords(
  originalDeviceChords: CharaChordFile["chords"],
  newDeviceChords: CharaChordFile["chords"],
  ids: Map<string, KeyInfo>,
  codes: Map<number, KeyInfo>,
  doc: string,
): ChangeSet {
  const tree = parser.parse(doc);
  const result = parseCharaChords(
    tree,
    ids,
    codes,
    originalDeviceChords,
    (from, to) => doc.slice(from, to),
  );

  const exactChords = new Map<string, number>();
  for (const chord of originalDeviceChords) {
    const key = JSON.stringify(chord);
    const count = exactChords.get(key) ?? 0;
    exactChords.set(key, count + 1);
  }

  const changes: ChangeType[] = [];

  const inputModified = new Set<string>();
  for (const chord of newDeviceChords) {
    const key = JSON.stringify(chord);
    const count = exactChords.get(key) ?? 0;
    if (count > 0) {
      exactChords.set(key, count - 1);
      continue;
    }

    const inputKey = JSON.stringify(chord[0]);
    inputModified.add(inputKey);
    const byInput = result.inputs.get(inputKey);
    if (byInput) {
      if (
        byInput.phrase?.originalValue &&
        byInput.phrase.originalValue === byInput.phrase.value
      ) {
        changes.push({
          from: byInput.phrase.range[0],
          to: byInput.phrase.range[1],
          insert: chord[1]
            .map((code) => actionToValue(code, codes.get(code)))
            .join(""),
        });
      }
    } else {
      const [inputs, compound] = splitCompound(chord[0]);
      const sortedInput = canonicalInputSorting(inputs, chord[1]);
      changes.push({
        from: 0,
        to: 0,
        insert:
          (compound ? `|0x${compound.toString(16)}|` : "") +
          sortedInput
            .map((code) => actionToValue(code, codes.get(code)))
            .join("") +
          "=>" +
          chord[1]
            .map((code) => actionToValue(code, codes.get(code)))
            .join("") +
          "\n",
      });
    }
  }

  changes.push(
    ...exactChords
      .entries()
      .filter(([, count]) => count > 0)
      .map(([key]) => result.exact.get(key))
      .filter((chord) => chord !== undefined)
      .filter(
        (chord) =>
          chord.input && !inputModified.has(JSON.stringify(chord.input.value)),
      )
      .map(
        (chord) =>
          ({
            from: chord.range[0],
            to: chord.range[1],
            insert: "",
          }) satisfies ChangeSpec,
      ),
  );

  return ChangeSet.of(changes, doc.length);
}
