<script lang="ts">
  import { page } from "$app/stores";
  import { SvelteMap } from "svelte/reactivity";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import { shuffleInPlace } from "$lib/util/shuffle";
  import TrackWpm from "$lib/charrecorder/TrackWpm.svelte";
  import { fly } from "svelte/transition";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import ChordHud from "$lib/charrecorder/ChordHud.svelte";
  import type { InferredChord } from "$lib/charrecorder/core/types";
  import { onMount } from "svelte";
  import TrackText from "$lib/charrecorder/TrackText.svelte";
  import { browser } from "$app/environment";

  function initialThresholds(): [slow: number, fast: number][] {
    try {
      return JSON.parse(localStorage.getItem("mastery-thresholds") ?? "");
    } catch {
      return [
        [1500, 1050],
        [3000, 2500],
        [5000, 3500],
        [6000, 5000],
      ];
    }
  }

  let masteryThresholds: [slow: number, fast: number][] =
    $state(initialThresholds());

  let inputSentence = $derived(
    (browser && $page.url.searchParams.get("sentence")) || "Hello World",
  );
  let devTools = $derived(
    browser && $page.url.searchParams.get("dev") === "true",
  );
  let sentenceWords = $derived(inputSentence.split(" "));
  let currentWord = $state("");
  let wordStats = new SvelteMap<string, number[]>();
  let wordMastery = new SvelteMap<string, number>();
  let text = $state("");
  let level = $state(0);
  let lastWPM = $state(0);
  let bestWPM = $state(0);
  let wpm = $state(0);
  let chords: InferredChord[] = $state([]);
  let recorder = $state(new ReplayRecorder());

  let cooldown = $state(false);

  onMount(() => {
    selectNextWord();
  });

  $effect(() => {
    if (lastWPM > bestWPM) {
      bestWPM = lastWPM;
    }
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
      const masteryThreshold =
        masteryThresholds[level] ?? masteryThresholds.at(-1)!;
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

  let progress = $derived.by(() => {
    return words.length > 0
      ? words.reduce((a, word) => a + (wordMastery.get(word) ?? 0), 0) /
          words.length
      : 0;
  });

  $effect(() => {
    if (progress === 1 && level < masteryThresholds.length - 1) {
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
    text = "";
    currentWord = nextWord;
    recorder = new ReplayRecorder(nextWord);
  }

  function checkInput() {
    if (recorder.player.stepper.challenge.length === 0) return;
    const replay = recorder.finish(false);
    const elapsed = replay.finish - replay.start!;
    if (elapsed < masteryThresholds[level]![0]) {
      lastWPM = wpm;

      const prevStats = wordStats.get(currentWord) ?? [];
      prevStats.push(elapsed);
      wordStats.set(currentWord, prevStats.slice(-10));
    }

    cooldown = true;
    setTimeout(() => {
      selectNextWord();
      cooldown = false;
    });
  }

  $effect(() => {
    if (!cooldown && text && text === currentWord) checkInput();
  });

  function onkey(event: KeyboardEvent) {
    recorder.next(event);
  }
</script>

<div>
  <h1>Sentence Trainer</h1>

  <div class="levels">
    {#each masteryThresholds as _, i}
      <button
        class:active={level === i}
        class:mastered={i < level || progress === 1}
        class="threshold"
        onclick={() => {
          level = i;
          selectNextWord();
        }}
      >
        Level {i + 1}
      </button>
    {/each}
    {#each masteryThresholds as _, i}
      <div
        class="progress"
        style:--progress="{-100 *
          (1 - (level === i ? progress : i < level ? 1 : 0))}%"
        class:active={level === i}
      ></div>
    {/each}
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
  <ChordHud {chords} />
  <div class="container">
    <div
      class="input-section"
      onkeydown={onkey}
      onkeyup={onkey}
      tabindex="0"
      role="textbox"
    >
      {#if level === masteryThresholds.length - 1 && progress === 1}
        <div class="finish" in:fly={{ y: -50, duration: 500 }}>
          You have mastered this sentence!
        </div>
      {:else}
        {#key recorder}
          <div
            class="input"
            out:fly={{ y: 50, duration: 200 }}
            in:fly={{ y: -50, duration: 500 }}
          >
            <CharRecorder replay={recorder.player} cursor={true} keys={true}>
              <TrackText bind:text />
              <TrackWpm bind:wpm />
              <TrackChords bind:chords />
            </CharRecorder>
          </div>
        {/key}
      {/if}
    </div>
  </div>
  {#if devTools}
    <div>Dev Tools</div>
    <table>
      <tbody>
        {#each masteryThresholds as _, i}
          <tr>
            <th>L{i + 1}</th>
            <td><input bind:value={masteryThresholds[i]![0]} /></td>
            <td><input bind:value={masteryThresholds[i]![1]} /></td>
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

  .finish {
    font-weight: bold;
    grid-row: 1;
    grid-column: 1;
    color: var(--md-sys-color-primary);
    text-align: center;
    font-size: 1.5rem;
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

    &::after {
      content: "";
      display: block;
      height: 100%;
      width: 100%;
      background: var(--md-sys-color-primary);
      transform: translateX(var(--progress));
      transition: transform 0.2s;
    }
  }

  .threshold {
    width: auto;
    justify-self: center;
    opacity: 0.5;
    transition: opacity 0.2s;

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
