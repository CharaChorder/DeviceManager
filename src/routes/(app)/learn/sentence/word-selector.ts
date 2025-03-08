import { TOO_SHORT_SENTENCE_FOR_NGRAMS_MESSAGE } from "./constants";
import { SvelteMap } from "svelte/reactivity";

export function pickNextWord(
  words: string[],
  wordMastery: SvelteMap<string, number>,
  untrackedCurrentWord: string,
) {
  const unmasteredWords = words
    .map((it) => [it, wordMastery.get(it) ?? 0] as const)
    .filter(([, it]) => it !== 1);
  unmasteredWords.sort(([, a], [, b]) => a - b);
  let nextWord =
    unmasteredWords[0]?.[0] ??
    words[0] ??
    TOO_SHORT_SENTENCE_FOR_NGRAMS_MESSAGE;
  // This is important to break infinite loop created by
  // reading and writing `currentWord` inside $effect rune
  for (const [word] of unmasteredWords) {
    if (word === untrackedCurrentWord || Math.random() > 0.5) continue;
    nextWord = word;
    break;
  }
  return nextWord;
}
