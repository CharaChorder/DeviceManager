<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import { action as title } from "$lib/title";
  import { osLayout } from "$lib/os-layout";

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

  let tooltip = $derived(
    `&lt;${info.id ?? `0x${info.code.toString(16)}`}&gt; ` +
      (info.title ?? "") +
      (info.variant === "left"
        ? " (left)"
        : info.variant === "right"
          ? " (right)"
          : ""),
  );
</script>

{#if display === "keys"}
  <kbd
    class:icon={!!info.icon}
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    use:title={{ title: tooltip }}
  >
    {dynamicMapping ??
      info.icon ??
      info.display ??
      info.id ??
      `0x${info.code.toString(16)}`}
  </kbd>
{:else if display === "inline-keys"}
  {#if !info.icon && dynamicMapping?.length === 1}
    <span
      use:title={{ title: tooltip }}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{dynamicMapping}</span
    >
  {:else if !info.icon && info.id?.length === 1}
    <span
      use:title={{ title: tooltip }}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{info.id}</span
    >
  {:else}
    <kbd
      class="inline-kbd"
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      class:icon={!!info.icon}
      use:title={{ title: tooltip }}
    >
      {dynamicMapping ??
        info.icon ??
        info.display ??
        info.id ??
        `0x${info.code.toString(16)}`}</kbd
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
