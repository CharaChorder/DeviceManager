<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, shortcut }: { title?: string | Snippet; shortcut?: string } =
    $props();
</script>

{#if typeof title === "string"}
  <p>{@html title}</p>
{:else}
  {@render title?.()}
{/if}

{#if shortcut}
  <kbd>
    {#each shortcut.split("+") as key}
      <kbd>{key}</kbd>
    {/each}
  </kbd>
{/if}

<style lang="scss">
  p {
    margin-block: 0;

    :global(kbd.icon) {
      display: inline-flex;
      translate: 0 0.2em;
      font-size: inherit;
    }
  }
</style>
