<script lang="ts">
  let { title, shortcut }: { title?: string; shortcut?: string } = $props();
</script>

{#if title}
  <p>{@html title}</p>
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
