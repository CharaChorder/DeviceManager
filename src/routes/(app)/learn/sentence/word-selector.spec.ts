import { describe, it, beforeEach, expect, vi } from "vitest";
import { pickNextWord } from "./word-selector";
import { untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import { TOO_SHORT_SENTENCE_FOR_NGRAMS_MESSAGE } from "./constants";

// Mock untrack so it simply executes the callback, allowing us to spy on its usage.
vi.mock("svelte", () => ({
  untrack: vi.fn((fn: any) => fn()),
}));

describe("pickNextWord", () => {
  let words: string[];
  let wordMastery: SvelteMap<string, number>;
  let currentWord: string;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up sample words and mastery values.
    words = ["alpha", "beta", "gamma"];
    wordMastery = new SvelteMap<string, number>();
    // For this test, assume none of the words are mastered.
    words.forEach((word) => wordMastery.set(word, 0));
    currentWord = "alpha";
  });

  it("should return a word different from current", () => {
    // Force Math.random() to return a predictable value.
    vi.spyOn(Math, "random").mockReturnValueOnce(0.3);

    const nextWord = pickNextWord(words, wordMastery, currentWord);

    // Since currentWord ("alpha") should be skipped, we expect next word.
    expect(nextWord).toBe("beta");
  });

  it("should randomly skip words", () => {
    // Force Math.random() to return a predictable value.
    vi.spyOn(Math, "random").mockReturnValueOnce(0.6).mockReturnValueOnce(0.3);

    const nextWord = pickNextWord(words, wordMastery, currentWord);

    // Since currentWord ("alpha") should be skipped as current
    // and "beta" should be randomly skipped we expect "gamma".
    expect(nextWord).toBe("gamma");
  });

  it("should return current word if all other words were randomly skipped", () => {
    // Force Math.random() to return a predictable value.
    vi.spyOn(Math, "random").mockReturnValueOnce(0.6).mockReturnValueOnce(0.6);

    const nextWord = pickNextWord(words, wordMastery, currentWord);

    // Since all other words have been randomly skipped, we expect
    // current word to be returned.
    expect(nextWord).toBe("alpha");
  });

  it("current word should be passed untracked", () => {
    pickNextWord(words, wordMastery, currentWord);
    expect(untrack).toHaveBeenCalledTimes(0);
  });

  it("should return TOO_SHORT_SENTENCE_FOR_NGRAMS_MESSAGE if the words array is empty", () => {
    const result = pickNextWord([], wordMastery, currentWord);
    expect(result).toBe(TOO_SHORT_SENTENCE_FOR_NGRAMS_MESSAGE);
  });
});
