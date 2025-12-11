<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import { osLayout } from "$lib/os-layout";
  import { tooltip } from "$lib/hover-popover";
  import { isVerbose } from "./verbose-action";
  import { actionTooltip } from "$lib/title";

  let {
    action,
    display,
  }: { action: number | KeyInfo; display: "inline-keys" | "keys" | "verbose" } =
    $props();

  let info = $derived(
    typeof action === "number"
      ? ($KEYMAP_CODES.get(action) ?? { code: action })
      : action,
  );
  let dynamicMapping = $derived(info.keyCode && $osLayout.get(info.keyCode));
  let hasPopover = $derived(!info.id || info.title || info.description);
</script>

{#snippet popover()}
  {#if info.icon || info.display || !info.id}
    &lt;<b>{info.id ?? `0x${info.code.toString(16)}`}</b>&gt;
  {/if}
  {#if info.title}
    {info.title}
  {/if}
  {#if info.variant === "left"}
    (Left)
  {:else if info.variant === "right"}
    (Right)
  {/if}
  {#if info.description}
    <br />
    <small>{info.description}</small>
  {/if}
{/snippet}

{#snippet kbdText()}
  {dynamicMapping ??
    info.icon ??
    info.display ??
    info.id ??
    `0x${info.code.toString(16)}`}
{/snippet}
{#snippet kbdSnippet(withPopover = true)}
  <kbd
    class:icon={!!info.icon}
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    {@attach withPopover && hasPopover ? actionTooltip(popover) : null}
  >
    {@render kbdText()}
  </kbd>
{/snippet}
{#snippet inlineKbdSnippet()}
  {#if !info.icon && dynamicMapping?.length === 1}
    <span
      {@attach hasPopover ? actionTooltip(popover) : null}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{dynamicMapping}</span
    >
  {:else if !info.icon && info.id?.length === 1}
    <span
      {@attach hasPopover ? actionTooltip(popover) : null}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{info.id}</span
    >
  {:else}
    <kbd
      class="inline-kbd"
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      class:icon={!!info.icon}
      {@attach hasPopover ? actionTooltip(popover) : null}
    >
      {@render kbdText()}
    </kbd>
  {/if}
{/snippet}

{#if display === "keys"}
  {@render kbdSnippet()}
{:else if display === "verbose"}
  {#if isVerbose(info)}
    <div class="verbose" {@attach hasPopover ? actionTooltip(popover) : null}>
      {@render kbdSnippet(false)}
      <div class="verbose-title">{info.title}</div>
    </div>
  {:else}
    {@render inlineKbdSnippet()}
  {/if}
{:else if display === "inline-keys"}
  {@render inlineKbdSnippet()}
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

  div[popover] {
    width: fit-content;
    max-width: 200px;
    height: fit-content;
    text-align: left;
    text-wrap: break-word;

    small {
      opacity: 0.8;
      font-size: 0.9em;
    }
  }

  .verbose {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-inline: 2px;
    min-width: 160px;
    height: 32px;

    kbd {
      justify-content: flex-start;
    }

    .verbose-title {
      display: -webkit-box;
      opacity: 0.9;
      max-width: 15ch;
      overflow: hidden;
      font-style: italic;
      font-size: 12px;
      text-align: left;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2; /* number of lines to show */
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
