<script lang="ts">
  import { page } from "$app/stores";
  import { SvelteMap } from "svelte/reactivity";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import { shuffleInPlace } from "$lib/util/shuffle";
  import { fade, fly, slide } from "svelte/transition";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import ChordHud from "$lib/charrecorder/ChordHud.svelte";
  import type { InferredChord } from "$lib/charrecorder/core/types";
  import { onMount } from "svelte";
  import TrackText from "$lib/charrecorder/TrackText.svelte";
  import { browser } from "$app/environment";
  import { expoIn, expoOut } from "svelte/easing";

  function viaLocalStorage<T>(key: string, initial: T) {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "");
    } catch {
      return initial;
    }
  }

  let masteryThresholds: [slow: number, fast: number, title: string][] = $state(
    viaLocalStorage("mastery-thresholds", [
      [1500, 1050, "Words"],
      [3000, 2500, "Pairs"],
      [5000, 3500, "Trios"],
    ]),
  );

  const avgWordLength = 5;

  function reset() {
    localStorage.removeItem("mastery-thresholds");
    localStorage.removeItem("idle-timeout");
    window.location.reload();
  }

  let inputSentence = $derived(
    (browser && $page.url.searchParams.get("sentence")) || "Hello World",
  );
  let wpmTarget = $derived(
    (browser && Number($page.url.searchParams.get("wpm"))) || 250,
  );
  let devTools = $derived(
    browser && $page.url.searchParams.get("dev") === "true",
  );
  let sentenceWords = $derived(inputSentence.split(" "));
  let msPerChar = $derived((1 / ((wpmTarget / 60) * avgWordLength)) * 1000);
  let totalMs = $derived(inputSentence.length * msPerChar);
  let msPerWord = $derived(
    (inputSentence.length * msPerChar) / inputSentence.split(" ").length,
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

  let cooldown = $state(false);

  onMount(() => {
    selectNextWord();
  });

  $effect(() => {
    if (wpm > bestWPM) {
      bestWPM = wpm;
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
    const words = inputSentence.trim().split(" ");
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
    const unmasteredWords = words
      .map((it) => [it, wordMastery.get(it) ?? 0] as const)
      .filter(([, it]) => it !== 1);
    unmasteredWords.sort(([, a], [, b]) => a - b);
    let nextWord = unmasteredWords[0]?.[0] ?? words[0] ?? "ERROR";
    for (const [word] of unmasteredWords) {
      if (word === currentWord || Math.random() > 0.5) continue;
      nextWord = word;
      break;
    }
    currentWord = nextWord;
    recorder = new ReplayRecorder(nextWord);
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
</script>

<div>
  <h1>Sentence Trainer</h1>

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
            >ms</td
          >
        </tr>
        <tr>
          <th>Char</th>
          <td
            ><span style:color="var(--md-sys-color-tertiary)"
              >{Math.round(msPerChar)}</span
            >ms</td
          >
        </tr>
        <tr>
          <th>Word</th>
          <td
            ><span style:color="var(--md-sys-color-tertiary)"
              >{Math.round(msPerWord)}</span
            >ms</td
          >
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
                : 'tertiary'})">{Math.round(mastery * 100)}%</td
            >
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
    width: min-content;
    display: grid;
    transition: scale 0.2s ease;

    * {
      grid-row: 1;
    }
  }

  .finish {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    font-weight: bold;
    justify-items: center;
    align-items: center;
  }

  .sentence {
    display: grid;
    width: min-content;
    gap: 4px 1ch;
    grid-template-rows: repeat(4, auto);
    margin-block: 1rem;

    .word,
    .arch {
      transition: opacity 0.2s ease;

      &.mastered {
        color: var(--md-sys-color-primary);
        border-color: var(--md-sys-color-primary);
      }
    }

    .arch {
      border: 2px solid var(--md-sys-color-outline);
      height: 8px;
    }
  }

  .progress {
    position: relative;
    height: 1rem;
    width: auto;
    background: var(--md-sys-color-outline-variant);
    border: none;
    overflow: hidden;
    grid-row: 2;

    &::before,
    &::after {
      position: absolute;
      content: "";
      display: block;
      height: 100%;
      width: 100%;
      transition: transform 0.2s;
    }

    &::before {
      background: var(--md-sys-color-outline);
      transform: translateX(var(--progress));
    }

    &::after {
      background: var(--md-sys-color-primary);
      transform: translateX(var(--mastered));
    }
  }

  .threshold {
    width: auto;
    justify-self: center;
    opacity: 0.5;
    transition: opacity 0.2s;
    grid-row: 1;

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
    font-size: 1.5rem;
    padding: 1rem;
    max-width: 16cm;
    outline: 2px dashed transparent;
    border-radius: 0.25rem;
    margin-block: 1rem;
    transition:
      outline 0.2s ease,
      border-radius 0.2s ease;
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
