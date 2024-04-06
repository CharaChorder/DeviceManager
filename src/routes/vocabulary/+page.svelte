<script lang="ts">
  import { chords } from "$lib/undo-redo";
  import Action from "$lib/components/Action.svelte";
  import { onDestroy, onMount } from "svelte";
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import { fly } from "svelte/transition";
  import type { Chord } from "$lib/serial/chord";

  const speedRating = [
    [400, "+100", "excited", true],
    [700, "+50", "satisfied", true],
    [1400, "+25", "neutral", true],
    [3000, "0", "dissatisfied", false],
    [Infinity, "-50", "sad", false],
  ] as const;
  const accuracyRating = [
    [2, "+100", "calm", true],
    [3, "+50", "content", false],
    [5, "+25", "stressed", false],
    [7, "0", "frustrated", false],
    [14, "-25", "very_dissatisfied", false],
    [Infinity, "-50", "extremely_dissatisfied", false],
  ] as const;

  let next: Chord[] = [];
  let nextHandle: number;
  let took: number | undefined;
  let delta = 0;

  let speed: readonly [number, string, string, boolean] | undefined;
  let accuracy: readonly [number, string, string, boolean] | undefined;
  let progress = 0;

  let attempts = 0;

  let userInput = "";

  onMount(() => {
    runTest();
  });

  function runTest() {
    if (took === undefined) {
      took = performance.now();
      delta = 0;
      attempts = 0;
      userInput = "";
      if (next.length === 0) {
        next = Array.from(
          { length: 5 },
          () => $chords[Math.floor(Math.random() * $chords.length)],
        );
      } else {
        next.shift();
        next.push($chords[Math.floor(Math.random() * $chords.length)]);
        next = next;
      }
    }
    if (
      userInput ===
      next[0].phrase
        .map((it) => (it === 32 ? " " : KEYMAP_CODES[it]!.id))
        .join("") +
        " "
    ) {
      took = undefined;
      speed = speedRating.find(([max]) => delta <= max);
      accuracy = accuracyRating.find(([max]) => attempts <= max);
      progress++;
    } else {
      delta = performance.now() - took;
    }

    nextHandle = requestAnimationFrame(runTest);
  }

  let debounceTimer = 0;

  function backspace(event: KeyboardEvent) {
    if (event.code === "Backspace") {
      userInput = userInput.slice(0, -1);
    }
  }

  function input(event: KeyboardEvent) {
    const stamp = performance.now();
    if (stamp - debounceTimer > 50) {
      attempts++;
    }
    debounceTimer = stamp;
    userInput += event.key;
  }

  onDestroy(() => {
    if (nextHandle) {
      cancelAnimationFrame(nextHandle);
    }
  });
</script>

<svelte:window on:keydown={backspace} on:keypress={input} />

<h1>Vocabulary Trainer</h1>

{#if next[0]}
  <div class="row">
    {#key progress}
      <div
        in:fly={{ duration: 300, x: -48 }}
        out:fly={{ duration: 1000, x: 128 }}
        class="rating"
      >
        {#if speed}
          <span class="rating-item">
            <span
              style:color="var(--md-sys-color-{speed[3] ? `primary` : `error`})"
              class="icon">timer</span
            >
            {speed[1]}
            <span class="icon">sentiment_{speed[2]}</span>
          </span>
        {/if}
        {#if accuracy}
          <span class="rating-item">
            <span
              style:color="var(--md-sys-color-{accuracy[3]
                ? `primary`
                : `error`})"
              class="icon">target</span
            >
            {accuracy[1]}
            <span class="icon">sentiment_{accuracy[2]}</span>
          </span>
        {/if}
      </div>
    {/key}
  </div>
  <div class="hint" style:opacity={delta > 3000 ? 1 : 0}>
    {#each next[0].actions as action}
      <Action {action} display="keys" />
    {/each}
  </div>
  <div>
    {userInput}
  </div>
  {#each next as chord, i}
    <div class="words" style:opacity={1 - i / next.length}>
      {#each chord.phrase as action}
        <Action {action} />
      {/each}
    </div>
  {/each}
{:else}
  <p>You don't have any chords</p>
{/if}

<style lang="scss">
  .row {
    position: relative;
    height: 48px;
  }

  .rating-item {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }

  .rating {
    position: absolute;
    left: -48px;
    width: max-content;
  }
</style>
