<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import { osLayout } from "$lib/os-layout";
  import { tooltip } from "$lib/hover-popover";

  let {
    action,
    display,
  }: { action: number | KeyInfo; display: "inline-keys" | "keys" } = $props();

  let info = $derived(
    typeof action === "number"
      ? ($KEYMAP_CODES.get(action) ?? { code: action })
      : action,
  );
  let dynamicMapping = $derived(info.keyCode && $osLayout.get(info.keyCode));

  let popover: HTMLElement | undefined = $state(undefined);
</script>

{#snippet popoverSnippet()}
  <div bind:this={popover} popover="hint">
    &lt;{info.id ?? `0x${info.code.toString(16)}`}&gt;
    {#if info.title}
      {info.title}
    {/if}
    {#if info.variant === "left"}
      (Left)
    {:else if info.variant === "right"}
      (Right)
    {/if}
  </div>
{/snippet}

{#if display === "keys"}
  <kbd
    class:icon={!!info.icon}
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    {@attach tooltip(popover)}
  >
    {dynamicMapping ??
      info.icon ??
      info.display ??
      info.id ??
      `0x${info.code.toString(16)}`}
    {@render popoverSnippet()}
  </kbd>
{:else if display === "inline-keys"}
  {#if !info.icon && dynamicMapping?.length === 1}
    <span
      {@attach tooltip(popover)}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      >{dynamicMapping}{@render popoverSnippet()}</span
    >
  {:else if !info.icon && info.id?.length === 1}
    <span
      {@attach tooltip(popover)}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      >{info.id}{@render popoverSnippet()}</span
    >
  {:else}
    <kbd
      class="inline-kbd"
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      class:icon={!!info.icon}
      {@attach tooltip(popover)}
    >
      {dynamicMapping ??
        info.icon ??
        info.display ??
        info.id ??
        `0x${info.code.toString(16)}`}{@render popoverSnippet()}</kbd
    >
  {/if}
{/if}

<style lang="scss">
  kbd:not(.inline-kbd) {
    transition: color 250ms ease;
    padding-block: auto;
    height: 24px;
  }

  .left {
    border-left-width: 3px;
  }
  .right {
    border-right-width: 3px;
  }

  .inline-kbd {
    margin-inline-end: 2px;
  }

  :global(span) + .inline-kbd {
    margin-inline-start: 2px;
  }
</style>
