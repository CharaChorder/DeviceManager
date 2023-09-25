<script lang="ts">
  export let title: string | undefined
  export let shortcut: string | undefined
</script>

{#if title}
  <p>{title}</p>
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
  }
</style>
