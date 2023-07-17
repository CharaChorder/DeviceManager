<script lang="ts">
  import {tick} from "svelte"
  import LayoutCC1 from "$lib/components/LayoutCC1.svelte"
  import {chords, highlightActions} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes.js"

  $: content = Array.from({length: 10}).map(() => $chords[Math.floor(Math.random() * $chords.length)])

  let cursor = [0, 0]
  let input = []

  $: {
    $highlightActions = content[cursor[0]]?.actions ?? []
  }

  function keypress(event: KeyboardEvent) {
    cursor++
    input.push(event.key)
  }
</script>

<svelte:window on:keypress={keypress} />

<div>
  <section>
    <!-- <div class="cursor" style="translate: calc({cursor}ch - 50%) -50%" /> -->
    {#each content as word, i}
      {#if word}
        {#each word.phrase as letter, j}
          <span>{KEYMAP_CODES[letter].id}</span>
        {/each}
        &nbsp;
      {/if}
    {/each}
  </section>

  <LayoutCC1 />
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    height: 100%;
  }

  section {
    position: relative;

    display: flex;
    flex-direction: row;

    font-size: 1.3rem;
    font-weight: 500;
  }

  .letter {
    position: relative;
    filter: brightness(50%);
  }

  .cursor {
    position: absolute;
    top: 50%;
    left: 0;
    translate: -50% -50%;

    width: 2px;
    height: 1em;

    background: var(--md-sys-color-primary);

    transition: all 250ms ease;
  }
</style>
