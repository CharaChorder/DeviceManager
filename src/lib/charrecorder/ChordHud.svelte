<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import { KBD_ICONS } from "./renderer/kbd-icon.js";
  import { expoOut } from "svelte/easing";
  import type { InferredChord } from "./core/types.js";

  let { chords }: { chords: InferredChord[] } = $props();

  function getPercent(
    deviation: number,
    inputCount: number,
    perfect: number,
    fail: number,
  ) {
    const failAdjusted = fail * inputCount;
    const perfectAdjusted = perfect * inputCount;
    return Math.min(
      1,
      Math.max(
        0,
        Math.max(0, deviation - perfectAdjusted) /
          (failAdjusted - perfectAdjusted),
      ),
    );
  }

  function getColor(percent: number, alpha = 1) {
    return `hsl(${(1 - percent) * 120}deg 50% 50% / ${alpha})`;
  }
</script>

<section>
  {#each chords as { input, id, deviation }, i (id)}
    {@const a = getPercent(deviation[0], input.length, 10, 25)}
    {@const b = getPercent(deviation[1], input.length, 10, 18)}
    {@const max = Math.max(a, b)}
    <div
      class="chord"
      out:fly={{ x: -100 }}
      style:translate="calc(-{(chords.length - i - 1) * 5}em - 50%) 0"
      style:scale={1 - (chords.length - i) / 6}
      style:opacity={1 - (chords.length - i - 1) / 6}
      title="Press: {deviation[0]}ms, Release: {deviation[1]}ms"
    >
      <div
        class="rating"
        style:color={getColor(max)}
        style:text-shadow="0 0 {Math.round((1 - max) * 10)}px {getColor(
          max,
          0.6,
        )}"
        in:scale={{
          start: 1.5 + 1.2 * (1 - max),
          easing: expoOut,
          duration: 1000,
        }}
      >
        {#if max === 1}
          Close
        {:else if max > 0.5}
          Okay
        {:else if max > 0}
          Good
        {:else}
          Perfect
        {/if}
      </div>
      <div
        in:fly={{ y: 20, easing: expoOut, duration: 1000 }}
        class="tile"
        style:background="linear-gradient(to right, {getColor(a)}, {getColor(
          b,
        )})"
      ></div>
      <div in:fly={{ y: 60, easing: expoOut, duration: 1000 }}>
        {#each input as token}
          <kbd>{KBD_ICONS.get(token.code)}</kbd>
        {/each}
      </div>
    </div>
  {/each}
</section>

<style>
  section {
    display: grid;
    position: relative;
    margin: 1em;
    margin-bottom: 0;
    height: 3em;
    font-size: 2em;
  }

  .rating {
    font-style: italic;
    font-weight: bold;
    text-transform: uppercase;
  }

  .tile {
    border-radius: 0.1em;
    width: 100%;
    height: 0.2em;
  }

  kbd {
    font-size: 0.6em;
  }

  kbd + kbd {
    margin-inline-start: 0.3em;
  }

  .chord {
    display: flex;
    position: absolute;
    top: 0;
    left: 50%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition:
      opacity 0.3s ease,
      translate 0.3s ease,
      scale 0.3s ease;
    will-change: transform, opacity, scale;
    margin-inline-end: 1em;
    padding-inline: 0.1em;
  }
</style>
