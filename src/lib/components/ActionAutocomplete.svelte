<script lang="ts">
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import ActionListItem from "$lib/components/ActionListItem.svelte"

  export let exact: number | undefined = undefined
  export let code: number = Number.NaN
  export let results: number[] = []

  export let width: number
</script>

<div class="list" style="width: {width}px">
  {#if exact !== undefined}
    <div class="exact">
      <i>Exact match</i>
      <ActionListItem id={exact} />
    </div>
  {/if}
  {#if !exact && code}
    {#if code >= 2 ** 5 && code < 2 ** 13}
      <button>USE CODE</button>
    {:else}
      <div>Action code is out of range</div>
    {/if}
  {/if}
  {#each results as id (id)}
    <ActionListItem {id} />
  {/each}
</div>

<style lang="scss">
  .list {
    --scrollbar-color: var(--md-sys-color-on-surface-variant);

    scrollbar-gutter: stable both-edges;

    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    max-height: 500px;
    padding-block: 8px;
  }

  .exact {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;

    border: 1px solid var(--md-sys-color-primary);
    border-radius: 8px;

    > i {
      padding-inline: 8px;
      color: var(--md-sys-color-on-primary);
      background: var(--md-sys-color-primary);
      border-radius: 0 0 8px 8px;
    }
  }
</style>
