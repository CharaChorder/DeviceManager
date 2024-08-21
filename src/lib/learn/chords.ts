import { osLayout } from "$lib/os-layout";
import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
import { persistentWritable } from "$lib/storage";
import { type ChordInfo, chords } from "$lib/undo-redo";
import { derived } from "svelte/store";

export const words = derived(
  [chords, osLayout],
  ([chords, layout]) =>
    new Map<string, ChordInfo>(
      chords
        .map((chord) => ({
          chord,
          output: chord.phrase.map((action) =>
            layout.get(KEYMAP_CODES.get(action)?.keyCode ?? ""),
          ),
        }))
        .filter(({ output }) => output.every((it) => !!it))
        .map(({ chord, output }) => [output.join("").trim(), chord] as const),
    ),
);

interface Score {
  lastTyped: number;
  score: number;
  total: number;
}

export const scores = persistentWritable<Record<string, Score>>("scores", {});

export const learnConfigDefault = {
  maxScore: 3,
  minScore: -3,
  scoreBlend: 0.5,
  weakRate: 0.8,
  weakBoost: 0.5,
  maxWeak: 3,
  newRate: 0.3,
  initialNewRate: 0.9,
  initialCount: 10,
};
export const learnConfigStored = persistentWritable<
  Partial<typeof learnConfigDefault>
>("learn-config", {});
export const learnConfig = derived(learnConfigStored, (config) => ({
  ...learnConfigDefault,
  ...config,
}));

let lastWord: string | undefined;

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

function randomLog2<T>(array: T[], max = array.length): T | undefined {
  return array[
    Math.floor(Math.pow(2, Math.log2(Math.random() * Math.log2(max))))
  ];
}

export const nextWord = derived(
  [words, scores, learnConfig],
  ([words, scores, config]) => {
    const values = Object.entries(scores).filter(([it]) => it !== lastWord);

    values.sort(([, a], [, b]) => a.score - b.score);
    const weakCount =
      (values.findIndex(([, { score }]) => score > 0) + 1 ||
        values.length + 1) - 1;
    const weak = randomLog2(values, weakCount);
    if (weak && Math.random() / weakCount < config.weakRate) {
      lastWord = weak[0];
      return weak[0];
    }

    values.sort(([, { lastTyped: a }], [, { lastTyped: b }]) => a - b);
    const recent = randomLog2(values);
    const newRate =
      values.length < config.initialCount
        ? config.initialNewRate
        : config.newRate;
    if (
      recent &&
      (Math.random() < Math.min(1, Math.max(0, weakCount / config.maxWeak)) ||
        Math.random() > newRate)
    ) {
      lastWord = recent[0];
      return recent[0];
    }

    const newWord = shuffle(Array.from(words.keys())).find((it) => !scores[it]);
    const word = newWord || recent?.[0] || weak?.[0];
    lastWord = word;
    return word;
  },
);
