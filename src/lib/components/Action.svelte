<script lang="ts">
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import type {KeyInfo} from "$lib/serial/keymap-codes"
  import {action as title} from "$lib/title"
  import {osLayout} from "$lib/os-layout"
  import LL from "../../i18n/i18n-svelte"

  export let action: number | KeyInfo
  export let display: "inline-keys" | "keys" = "inline-keys"

  $: info = typeof action === "number" ? KEYMAP_CODES[action] ?? {code: action} : action
  $: dynamicMapping = info.keyCode && $osLayout[JSON.stringify([info.keyCode])]

  $: tooltip =
    (info.title ?? info.id ?? `0x${info.code.toString(16)}`) +
    (info.variant === "left" ? " (left)" : info.variant === "right" ? " (right)" : "")
</script>

{#if dynamicMapping}
  <span
    use:title={{title: $LL.actionSearch.LIVE_LAYOUT_INFO()}}
    class="dynamic"
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    class:inline={display === "inline-keys"}>{dynamicMapping}</span
  >
{:else if display === "keys"}
  <kbd
    class:icon={!!info.icon}
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    use:title={{title: tooltip}}
  >
    {info.icon ?? info.display ?? info.id ?? `0x${info.code.toString(16)}`}
  </kbd>
{:else if display === "inline-keys"}
  {#if !info.icon && info.id?.length === 1}
    <span class:left={info.variant === "left"} class:right={info.variant === "right"}>{info.id}</span>
  {:else}
    <kbd
      class="inline-kbd"
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      class:icon={!!info.icon}
      use:title={{title: tooltip}}
    >
      {info.icon ?? info.display ?? info.id ?? `0x${info.code.toString(16)}`}</kbd
    >
  {/if}
{/if}

<style lang="scss">
  kbd:not(.inline-kbd) {
    height: 24px;
    padding-block: auto;
    transition: color 250ms ease;
  }

  .left {
    border-left-width: 3px;
  }
  .right {
    border-right-width: 3px;
  }

  .dynamic {
    padding: 4px;
    border-radius: 1px;
    min-width: 8px;
    background: var(--md-sys-color-surface-variant);

    &.inline {
      padding: 0px;
    }
  }

  .inline-kbd {
    margin-inline-end: 2px;
  }

  :global(span) + .inline-kbd {
    margin-inline-start: 2px;
  }
</style>
