<script lang="ts">
  import { page } from "$app/stores";
  import { SvelteMap } from "svelte/reactivity";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import debounce from "$lib/util/debounce";
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import { shuffleInPlace } from "$lib/util/shuffle";
  import { fade, fly, slide } from "svelte/transition";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import ChordHud from "$lib/charrecorder/ChordHud.svelte";
  import type { InferredChord } from "$lib/charrecorder/core/types";
  import TrackText from "$lib/charrecorder/TrackText.svelte";
  import { browser } from "$app/environment";
  import { expoOut } from "svelte/easing";
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import {
    type PageParam,
    SENTENCE_TRAINER_PAGE_PARAMS,
  } from "./configuration";
  import {
    AVG_WORD_LENGTH,
    MILLIS_IN_SECOND,
    SECONDS_IN_MINUTE,
  } from "./constants";
  import { pickNextWord } from "./word-selector";

  /**
   * Resolves parameter from search URL or returns default
   * @param param {@link PageParam} generic parameter that can be provided
   * in search url
   * @return Value of the parameter converted to its type or default value
   * if parameter is not present in the URL.
   */
  function getParamOrDefault<T>(param: PageParam<T>): T {
    if (browser) {
      const value = $page.url.searchParams.get(param.key);
      if (null !== value) {
        return param.parse ? param.parse(value) : (value as unknown as T);
      }
    }
    return param.default;
  }

  function viaLocalStorage<T>(key: string, initial: T) {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "");
    } catch {
      return initial;
    }
  }

  // Delay to ensure cursor is visible after focus is set.
  // it is a workaround for conflict between goto call on sentence update
  // and cursor focus when next word is selected.
  const CURSOR_FOCUS_DELAY_MS = 10;

  let masteryThresholds: [slow: number, fast: number, title: string][] = $state(
    viaLocalStorage("mastery-thresholds", [
      [1500, 1050, "Words"],
      [3000, 2500, "Pairs"],
      [5000, 3500, "Trios"],
    ]),
  );

  function reset() {
    localStorage.removeItem("mastery-thresholds");
    localStorage.removeItem("idle-timeout");
    window.location.reload();
  }

  const inputSentence = $derived(
    getParamOrDefault(SENTENCE_TRAINER_PAGE_PARAMS.sentence),
  );

  const wpmTarget = $derived(
    getParamOrDefault(SENTENCE_TRAINER_PAGE_PARAMS.wpm),
  );

  const devTools = $derived(
    getParamOrDefault(SENTENCE_TRAINER_PAGE_PARAMS.showDevTools),
  );

  let chordInputContainer: HTMLDivElement | null = null;

  let sentenceWords = $derived(inputSentence.trim().split(/\s+/));

  let inputSentenceLength = $derived(inputSentence.length);
  let msPerChar = $derived(
    (1 / ((wpmTarget / SECONDS_IN_MINUTE) * AVG_WORD_LENGTH)) *
      MILLIS_IN_SECOND,
  );
  let totalMs = $derived(inputSentenceLength * msPerChar);
  let msPerWord = $derived(
    (inputSentenceLength * msPerChar) / sentenceWords.length,
  );
  let currentWord = $state("");
  let wordStats = new SvelteMap<string, number[]>();
  let wordMastery = new SvelteMap<string, number>();
  let text = $state("");
  let level = $state(0);
  let bestWPM = $state(0);
  let wpm = $state(0);
  let chords: InferredChord[] = $state([]);
  let recorder = $state(new ReplayRecorder());
  let idle = $state(true);
  let idleTime = $state(viaLocalStorage("idle-timeout", 100));

  let idleTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (wpm > bestWPM) {
      bestWPM = wpm;
    }
  });

  $effect(() => {
    if (browser && $page.url.searchParams) {
      selectNextWord();
    }
  });

  $effect(() => {
    localStorage.setItem("idle-timeout", idleTime.toString());
  });

  $effect(() => {
    localStorage.setItem(
      "mastery-thresholds",
      JSON.stringify(masteryThresholds),
    );
  });

  let words = $derived.by(() => {
    const words = sentenceWords;
    switch (level) {
      case 0: {
        shuffleInPlace(words);
        return words;
      }
      case 1: {
        const pairs = [];
        for (let i = 0; i < words.length - 1; i++) {
          pairs.push(`${words[i]} ${words[i + 1]}`);
        }
        shuffleInPlace(pairs);
        return pairs;
      }
      case 2: {
        const trios = [];
        for (let i = 0; i < words.length - 2; i++) {
          trios.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
        shuffleInPlace(trios);
        return trios;
      }
      default: {
        return [inputSentence];
      }
    }
  });

  $effect(() => {
    for (const [word, speeds] of wordStats.entries()) {
      const level = word.split(" ").length - 1;
      const masteryThreshold = masteryThresholds[level];
      if (masteryThreshold === undefined) continue;
      const averageSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
      wordMastery.set(
        word,
        1 -
          Math.min(
            1,
            Math.max(
              0,
              (averageSpeed - masteryThreshold[1]) /
                (masteryThreshold[0] - masteryThreshold[1]),
            ),
          ),
      );
    }
  });

  let progress = $derived(
    level === masteryThresholds.length
      ? Math.min(1, Math.max(0, bestWPM / wpmTarget))
      : words.length > 0
        ? words.reduce((a, word) => a + (wordMastery.get(word) ?? 0), 0) /
          words.length
        : 0,
  );
  let mastered = $derived(
    words.length > 0
      ? words.filter((it) => wordMastery.get(it) === 1).length / words.length
      : 0,
  );

  $effect(() => {
    if (progress === 1 && level < masteryThresholds.length) {
      level++;
    }
  });

  function selectNextWord() {
    const nextWord = pickNextWord(
      words,
      wordMastery,
      untrack(() => currentWord),
    );
    currentWord = nextWord;
    recorder = new ReplayRecorder(nextWord);
    setTimeout(() => {
      chordInputContainer?.focus();
    }, CURSOR_FOCUS_DELAY_MS);
  }

  function checkInput() {
    if (recorder.player.stepper.challenge.length === 0) return;
    const replay = recorder.finish(false);
    const elapsed = replay.finish - replay.start! - idleTime;
    if (elapsed < masteryThresholds[level]![0]) {
      const prevStats = wordStats.get(currentWord) ?? [];
      prevStats.push(elapsed);
      wordStats.set(currentWord, prevStats.slice(-10));
    }

    text = "";
    setTimeout(() => {
      selectNextWord();
    });
  }

  $effect(() => {
    if (!idle || !text) return;
    if (text.trim() !== currentWord.trim()) return;
    if (level === masteryThresholds.length) {
      const replay = recorder.finish();
      const elapsed = replay.finish - replay.start!;
      text = "";
      recorder = new ReplayRecorder(currentWord);
      console.log(elapsed, totalMs);
      wpm = (totalMs / elapsed) * wpmTarget;
    } else {
      checkInput();
    }
  });

  function onkey(event: KeyboardEvent) {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    idle = false;
    recorder.next(event);
    idleTimeout = setTimeout(() => {
      idle = true;
    }, idleTime);
  }

  function updateSentence(event: Event) {
    const params = new URLSearchParams(window.location.search);
    params.set(
      SENTENCE_TRAINER_PAGE_PARAMS.sentence.key,
      (event.target as HTMLInputElement).value,
    );
    goto(`?${params.toString()}`);
  }

  const debouncedUpdateSentence = debounce(
    updateSentence,
    getParamOrDefault(SENTENCE_TRAINER_PAGE_PARAMS.textAreaDebounceInMillis),
  );

  function handleInputAreaKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line.
      debouncedUpdateSentence.cancel(); // Cancel any pending debounced update
      updateSentence(event); // Update immediately
    }
  }
</script>

<div>
  <h1>Sentence Trainer</h1>
  <textarea
    rows="7"
    cols="80"
    oninput={debouncedUpdateSentence}
    onkeydown={handleInputAreaKeyDown}>{untrack(() => inputSentence)}</textarea
  >

  <div class="levels">
    {#each masteryThresholds as [, , title], i}
      <button
        class:active={level === i}
        class:mastered={i < level || progress === 1}
        class="threshold"
        onclick={() => {
          level = i;
          selectNextWord();
        }}
      >
        {title}
      </button>
    {/each}
    <button
      class:active={level === masteryThresholds.length}
      class:mastered={masteryThresholds.length < level || progress === 1}
      class="threshold"
      onclick={() => {
        level = masteryThresholds.length;
        selectNextWord();
      }}
    >
      {wpmTarget} WPM
    </button>
    {#each masteryThresholds as _, i}
      <div
        class="progress"
        style:--progress="{-100 *
          (1 - (level === i ? progress : i < level ? 1 : 0))}%"
        style:--mastered="{-100 *
          (1 - (level === i ? mastered : i < level ? 1 : 0))}%"
        class:active={level === i}
      ></div>
    {/each}
    <div
      class="progress"
      style:--progress="-100%"
      style:--mastered="{-100 *
        (1 -
          (level === masteryThresholds.length
            ? progress
            : masteryThresholds.length < level
              ? 1
              : 0))}%"
      class:active={level === masteryThresholds.length}
    ></div>
  </div>
  <div class="sentence">
    {#each sentenceWords as _, i}
      {#if i !== sentenceWords.length - 1}
        {@const word = sentenceWords.slice(i, i + 2).join(" ")}
        {@const mastery = wordMastery.get(word) ?? 0}
        <div
          class="arch"
          class:mastered={mastery === 1}
          style:opacity={mastery}
          style:grid-row={(i % 2) + 1}
          style:grid-column="{i + 1} / span 2"
          style:border-bottom="none"
        ></div>
      {/if}
    {/each}
    {#each sentenceWords as word, i}
      {@const mastery = wordMastery.get(word)}
      <div
        class="word"
        class:mastered={mastery === 1}
        style:opacity={mastery ?? 0}
        style:grid-row={3}
        style:grid-column={i + 1}
      >
        {word}
      </div>
    {/each}
    {#each sentenceWords as _, i}
      {#if i < sentenceWords.length - 2}
        {@const word = sentenceWords.slice(i, i + 3).join(" ")}
        {@const mastery = wordMastery.get(word) ?? 0}
        <div
          class="arch"
          class:mastered={mastery === 1}
          style:opacity={mastery}
          style:grid-row={(i % 3) + 4}
          style:grid-column="{i + 1} / span 3"
          style:border-top="none"
        ></div>
      {/if}
    {/each}
  </div>
  {#if level === masteryThresholds.length}
    {@const maxDigits = 4}
    {@const indices = Array.from({ length: maxDigits }, (_, i) => i)}
    {@const wpmString = Math.floor(bestWPM).toString().padStart(maxDigits, " ")}
    <div class="finish" transition:slide>
      <div
        class="wpm"
        style:grid-template-columns="repeat({maxDigits}, 1ch) 1ch auto"
        style:opacity={progress}
        style:font-size="3rem"
        style:color="var(--md-sys-color-{progress === 1
          ? 'primary'
          : 'on-background'})"
        style:scale={(progress + 0.5) / 2}
      >
        {#each indices as i}
          {@const char = wpmString[i]}
          {#key char}
            <div
              style:grid-column={i + 1}
              in:fly={{ y: 20, duration: 1000, easing: expoOut }}
              out:fly={{ y: -20, duration: 1000, easing: expoOut }}
            >
              {char}
            </div>
          {/key}
        {/each}
        <div style:grid-column={maxDigits + 3} style:justify-self="start">
          WPM
        </div>
      </div>
      <div
        class="wpm"
        style:grid-template-columns="4ch 1ch auto"
        style:font-size="1.5rem"
      >
        {#key wpm}
          <div
            style:grid-column={1}
            style:justify-self="end"
            transition:fade={{ duration: 200 }}
          >
            {Math.floor(wpm)}
          </div>
        {/key}
        <div style:grid-column={3} style:justify-self="start">WPM</div>
      </div>
    </div>
  {/if}
  <ChordHud {chords} />
  <div class="container">
    <div
      bind:this={chordInputContainer}
      class="input-section"
      onkeydown={onkey}
      onkeyup={onkey}
      tabindex="0"
      role="textbox"
    >
      {#key recorder}
        <div class="input" transition:fade={{ duration: 200 }}>
          <CharRecorder replay={recorder.player} cursor={true} keys={true}>
            <TrackText bind:text />
            <TrackChords bind:chords />
          </CharRecorder>
        </div>
      {/key}
    </div>
  </div>
  {#if devTools}
    <div>Dev Tools</div>
    <button onclick={reset}>Reset</button>
    <label>Idle Time <input bind:value={idleTime} /></label>
    <table>
      <tbody>
        <tr>
          <th>Total</th>
          <td
            ><span style:color="var(--md-sys-color-tertiary)"
              >{Math.round(totalMs)}</span
            >ms
          </td>
        </tr>
        <tr>
          <th>Char</th>
          <td
            ><span style:color="var(--md-sys-color-tertiary)"
              >{Math.round(msPerChar)}</span
            >ms
          </td>
        </tr>
        <tr>
          <th>Word</th>
          <td
            ><span style:color="var(--md-sys-color-tertiary)"
              >{Math.round(msPerWord)}</span
            >ms
          </td>
        </tr>
      </tbody>
    </table>
    <table>
      <tbody>
        {#each masteryThresholds as _, i}
          <tr>
            <th>L{i + 1}</th>
            <td><input bind:value={masteryThresholds[i]![0]} /></td>
            <td><input bind:value={masteryThresholds[i]![1]} /></td>
            <td><input bind:value={masteryThresholds[i]![2]} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <table>
      <tbody>
        {#each wordStats.entries() as [word, stats]}
          {@const mastery = wordMastery.get(word) ?? 0}
          <tr>
            <th>{word}</th>
            <td
              style:color="var(--md-sys-color-{mastery === 1
                ? 'primary'
                : 'tertiary'})"
              >{Math.round(mastery * 100)}%
            </td>
            {#each stats as stat}
              <td>{stat}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style lang="scss">
  .levels {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;

    button {
      margin: 0;
      font-size: 1rem;
    }
  }

  .wpm {
    display: grid;
    transition: scale 0.2s ease;
    width: min-content;

    * {
      grid-row: 1;
    }
  }

  .finish {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    align-items: center;
    justify-items: center;
    font-weight: bold;
  }

  .sentence {
    display: grid;
    grid-template-rows: repeat(4, auto);
    gap: 4px 1ch;
    margin-block: 1rem;
    width: min-content;

    .word,
    .arch {
      transition: opacity 0.2s ease;

      &.mastered {
        border-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-primary);
      }
    }

    .arch {
      border: 2px solid var(--md-sys-color-outline);
      height: 8px;
    }
  }

  .progress {
    position: relative;
    grid-row: 2;
    border: none;
    background: var(--md-sys-color-outline-variant);
    width: auto;
    height: 1rem;
    overflow: hidden;

    &::before,
    &::after {
      display: block;
      position: absolute;
      transition: transform 0.2s;
      width: 100%;
      height: 100%;
      content: "";
    }

    &::before {
      transform: translateX(var(--progress));
      background: var(--md-sys-color-outline);
    }

    &::after {
      transform: translateX(var(--mastered));
      background: var(--md-sys-color-primary);
    }
  }

  .threshold {
    grid-row: 1;
    justify-self: center;
    opacity: 0.5;
    transition: opacity 0.2s;
    width: auto;

    &.mastered,
    &.active {
      opacity: 1;
    }

    &.mastered {
      color: var(--md-sys-color-primary);
    }
  }

  .input-section {
    display: grid;
    cursor: text;

    :global(.cursor) {
      opacity: 0;
    }
  }

  .input {
    display: flex;
    grid-row: 1;
    grid-column: 1;
    transition:
      outline 0.2s ease,
      border-radius 0.2s ease;
    margin-block: 1rem;
    outline: 2px dashed transparent;
    border-radius: 0.25rem;
    padding: 1rem;
    max-width: 16cm;
    font-size: 1.5rem;
  }

  .input-section:focus-within {
    outline: none;

    .input {
      outline-color: var(--md-sys-color-primary);
      border-radius: 1rem;
    }

    :global(.cursor) {
      opacity: 1;
    }
  }
</style>
