<script lang="ts">
  import { fade, slide } from "svelte/transition";

  let { value }: { value: number } = $props();

  let digits: number[] = $derived(value.toString().split("").map(Number));
  const nums = Array.from({ length: 10 }, (_, i) => i);
</script>

<div class="digits" style:width="{digits.length}ch">
  {#each digits as digit, i (digits.length - i)}
    <div
      class="digit-wrapper"
      style:right="{digits.length - 1 - i}ch"
      transition:fade
    >
      {#each nums as num (num)}
        <div
          class="digit"
          style:transform="translateY({(digit - num) / 4}em)"
          style:opacity={digit === num ? 1 : 0}
        >
          {num}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .digits {
    display: inline-block;
    position: relative;
    transition: width 500ms ease;
  }

  .digit-wrapper {
    display: inline-grid;
    width: 1ch;
    height: 1em;
  }

  .digit {
    display: inline-block;
    grid-row: 1;
    grid-column: 1;
    transition:
      transform 500ms ease,
      opacity 500ms ease;
  }
</style>
