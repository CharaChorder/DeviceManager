<script lang="ts">
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import type {KeyInfo} from "$lib/serial/keymap-codes"

  export let action: number | KeyInfo
  export let display: "inline-keys" | "keys" = "inline-keys"

  $: info = typeof action === "number" ? KEYMAP_CODES[action] ?? {code: action} : action
</script>

{#if display === "keys"}
  <kbd class:icon={!!info.icon}>
    {info.icon ?? info.id ?? `0x${info.code.toString(16)}`}
  </kbd>
{:else if display === "inline-keys"}
  {#if !info.icon && info.id?.length === 1}
    <span>{info.id}</span>
  {:else}
    <kbd class="inline-kbd" class:icon={!!info.icon}
      >{info.icon ?? info.id ?? `0x${info.code.toString(16)}`}</kbd
    >
  {/if}
{/if}

<style lang="scss">
  kbd:not(.inline-kbd) {
    height: 24px;
    padding-block: auto;
    transition: color 250ms ease;
  }

  .inline-kbd {
    margin-inline-end: 2px;
  }

  :global(span) + .inline-kbd {
    margin-inline-start: 2px;
  }
</style>
