<script lang="ts">
  import Action from "$lib/components/Action.svelte";
  import type { ChordInfo } from "$lib/undo-redo";
  import { onMount, tick } from "svelte";

  let { chord }: { chord: ChordInfo } = $props();

  let actualElements: HTMLDivElement | undefined = $state(undefined);
  let pseudoElements: HTMLDivElement | undefined = $state(undefined);

  let widths: number[] = $state([]);

  onMount(async () => {
    for (const letter of chord.phrase) {
      const span = document.createElement("span");
      span.textContent = String.fromCodePoint(letter);
      pseudoElements?.appendChild(span);
    }

    await tick();
    await tick();
    await tick();
    await tick();

    update();
  });

  function update() {
    console.log(document.getSelection());
    pseudoElements?.childNodes.forEach((node, index) => {
      if (node instanceof HTMLElement) {
        const range = document.createRange();
        const actual = actualElements?.childNodes[index];
        range.setStartBefore(actual);
        range.setEndAfter(actual);
        const rect = range.getBoundingClientRect();
        console.log(rect);
        node.style.width = rect.width + "px";
      }
    });
  }
</script>

<div class="editor">
  <div class="visual" bind:this={actualElements}>
    {#each chord.phrase as action, index}
      <Action {action} display="inline-keys" />
    {/each}
  </div>
  <div contenteditable="true" bind:this={pseudoElements}></div>
</div>

<style lang="scss">
  .editor {
    position: relative;
  }

  [contenteditable="true"] {
    position: absolute;
    inset: 0;

    > :global(span) {
      display: inline-block;
      background: red;

      &:nth-child(even) {
        background: blue;
      }
    }
  }
</style>
