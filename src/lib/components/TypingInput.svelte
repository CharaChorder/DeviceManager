<script lang="ts">
  import {tick} from "svelte"
  import LayoutCC1 from "$lib/components/LayoutCC1.svelte"
  import {chords, highlightActions} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes.js"

  $: content = Array.from({length: 10}).map(() => $chords[Math.floor(Math.random() * $chords.length)])

  let cursor = [0, 0]

  $: {
    $highlightActions = content[cursor[0]]?.actions ?? []
  }

  function keypress(event: KeyboardEvent) {
    cursor[1]++
    if (cursor[1] >= content[cursor[0]].phrase.length) {
      cursor[0]++
      cursor[1] = 0
    }
  }
</script>

<svelte:window on:keypress={keypress} />

<div>
  <section>
    {#each content as word, i}
      {#if word}
        <span class="word">
          {#each word.phrase as letter, j}
            <span class="letter" class:active={i === cursor[0] && j === cursor[1]}
              >{KEYMAP_CODES[letter].id}</span
            >
          {/each}
        </span>
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
    display: flex;
    flex-direction: row;
    gap: 8px;

    font-size: 1.3rem;
    font-weight: 500;
  }

  .letter {
    position: relative;
  }

  .letter.active::before {
    content: "";

    position: absolute;
    top: 50%;
    translate: -50% -50%;

    width: 2px;
    height: 1em;

    background: var(--md-sys-color-primary);
  }
</style>
