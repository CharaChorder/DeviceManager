<script lang="ts">
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import {
    words,
    nextWord,
    scores,
    learnConfigDefault,
    learnConfig,
    learnConfigStored,
  } from "$lib/learn/chords";
  import { blur, fade } from "svelte/transition";
  import ChordActionEdit from "../../config/chords/ChordActionEdit.svelte";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import type { InferredChord } from "$lib/charrecorder/core/types";

  let recorder = $derived(new ReplayRecorder($nextWord));
  let start = performance.now();
  $effect(() => {
    start = recorder && performance.now();
  });

  let chords: InferredChord[] = $state([]);

  function onkeyboard(event: KeyboardEvent) {
    recorder.next(event);
  }

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  $effect(() => {
    const [chord] = chords;
    if (!chord) return;

    console.log(chord);

    if (chord.output.trim() === $nextWord) {
      scores.update((scores) => {
        const score = Math.max(
          $learnConfig.minScore,
          $learnConfig.maxScore - (performance.now() - start) / 1000,
        );

        if (!scores[$nextWord]) {
          scores[$nextWord] = {
            score,
            lastTyped: performance.now(),
            total: 1,
          };
          return scores;
        }

        const oldScore = scores[$nextWord].score;
        scores[$nextWord].score = lerp(
          score,
          oldScore,
          $learnConfig.scoreBlend,
        );
        scores[$nextWord].lastTyped = performance.now();
        scores[$nextWord].total += 1;

        return scores;
      });
    }
  });

  function skip() {
    button?.blur();
    scores.update((scores) => {
      return scores;
    });
  }

  let button = $state<HTMLButtonElement>();
</script>

<h2>WIP</h2>

<svelte:window onkeydown={onkeyboard} onkeyup={onkeyboard} />

{#key $nextWord}
  <h3>
    {$nextWord}
    {#if $scores[$nextWord!] === undefined}
      <sup class="new-word">new</sup>
    {:else if ($scores[$nextWord!]?.score ?? 0) < 0}
      <sup class="weak">weak</sup>
    {/if}
  </h3>

  <div class="chord" in:fade>
    <CharRecorder replay={recorder.player} cursor={true}>
      <TrackChords bind:chords />
    </CharRecorder>
  </div>
{/key}

{#key $nextWord}
  <div class="hint" in:fade={{ delay: 2000, duration: 500 }}>
    <ChordActionEdit chord={$words.get($nextWord!)} onsubmit={() => {}} />
  </div>
{/key}
<button onclick={skip} bind:this={button}>skip</button>

<section class="stats">
  <table>
    <thead>
      <tr><th>Weak</th></tr>
    </thead>
    <tbody>
      {#each Object.entries($scores)
        .sort(([, a], [, b]) => a.score - b.score)
        .splice(0, 10) as [word, score]}
        <tr class="decay">
          <td>{word}</td>
          <td><i>{score.score.toFixed(2)}</i></td>
        </tr>
      {/each}
    </tbody>
  </table>

  <table>
    <thead>
      <tr><th>Strong</th></tr>
    </thead>
    <tbody>
      {#each Object.entries($scores)
        .sort(([, a], [, b]) => b.score - a.score)
        .splice(0, 10) as [word, score]}
        <tr class="decay">
          <td>{word}</td>
          <td><i>{score.score.toFixed(2)}</i></td>
        </tr>
      {/each}
    </tbody>
  </table>

  <table>
    <thead>
      <tr><th>Rehearse</th></tr>
    </thead>
    <tbody>
      {#each Object.entries($scores)
        .sort(([, a], [, b]) => b.lastTyped - a.lastTyped)
        .splice(0, 10) as [word, score]}
        <tr class="decay">
          <td>{word}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<details>
  <summary>Settings</summary>
  <button onclick={() => ($scores = {})}>Reset</button>
  <table>
    <tbody>
      {#each Object.entries(learnConfigDefault) as [key, value]}
        <tr>
          <th>{key}</th>
          <td
            ><input
              type="number"
              value={$learnConfig[key] ?? value}
              step="0.1"
              oninput={(event) =>
                ($learnConfigStored[key] = event.target.value)}
            />
          </td>
          <td>
            <button
              disabled={!$learnConfigStored[key]}
              onclick={() => ($learnConfigStored[key] = undefined)}>⟲</button
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</details>

<style lang="scss">
  @use "sass:math";

  input {
    background: none;
    font: inherit;
    color: inherit;
    border: none;
    width: 5ch;
    text-align: right;
  }

  div {
    min-width: 20ch;
    padding: 1ch;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .stats {
    display: flex;
    gap: 3em;
  }

  sup {
    font-weight: normal;
    font-size: 0.8em;

    &.new-word {
      color: var(--md-sys-color-primary);
    }
    &.weak {
      color: var(--md-sys-color-error);
    }
  }

  @for $i from 1 through 10 {
    tr.decay:nth-child(#{$i}) {
      opacity: 1 - math.div($i, 10);
    }
  }
</style>
