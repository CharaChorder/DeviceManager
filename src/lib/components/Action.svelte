<script lang="ts">
  import { KEYMAP_CODES, KEYMAP_IDS } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import { osLayout } from "$lib/os-layout";
  import { isVerbose } from "./verbose-action";
  import { actionTooltip } from "$lib/title";
  import ActionTooltip from "./action/ActionTooltip.svelte";

  let {
    action,
    display,
    ignoreIcon = false,
    inText = false,
    withPopover = true,
  }: {
    action: string | number | KeyInfo;
    display: "inline-keys" | "keys" | "verbose";
    ignoreIcon?: boolean;
    inText?: boolean;
    withPopover?: boolean;
  } = $props();

  let retrievedInfo = $derived(
    typeof action === "number"
      ? $KEYMAP_CODES.get(action)
      : typeof action === "string"
        ? $KEYMAP_IDS.get(action)
        : action,
  );
  let info = $derived(
    retrievedInfo ??
      (typeof action === "number"
        ? ({ code: action } satisfies KeyInfo)
        : typeof action === "string"
          ? ({ code: 1024, id: action } satisfies KeyInfo)
          : action),
  );
  let icon = $derived(ignoreIcon ? undefined : info.icon);
  let dynamicMapping = $derived(info.keyCode && $osLayout.get(info.keyCode));
  let hasPopover = $derived(
    withPopover &&
      (!retrievedInfo || !info.id || info.title || info.description),
  );
</script>

{#snippet popover()}
  <ActionTooltip valid={!!retrievedInfo} {info} />
{/snippet}

{#snippet kbdText()}
  {dynamicMapping ??
    icon ??
    info.display ??
    info.id ??
    `0x${info.code.toString(16)}`}
{/snippet}
{#snippet kbdSnippet(withPopover = true)}
  <kbd
    class:in-text={inText}
    class:icon={!!icon}
    class:left={info.variant === "left"}
    class:right={info.variant === "right"}
    class:error={info.code > 1023}
    class:warn={!retrievedInfo}
    {@attach withPopover && hasPopover ? actionTooltip(popover) : null}
  >
    {@render kbdText()}
  </kbd>
{/snippet}
{#snippet inlineKbdSnippet()}
  {#if !info.icon && dynamicMapping?.length === 1}
    <span
      {@attach hasPopover ? actionTooltip(popover) : null}
      class:in-text={inText}
      class:error={info.code > 1023}
      class:warn={!retrievedInfo}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{dynamicMapping}</span
    >
  {:else if !icon && info.id?.length === 1}
    <span
      {@attach hasPopover ? actionTooltip(popover) : null}
      class:in-text={inText}
      class:error={info.code > 1023}
      class:warn={!retrievedInfo}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}>{info.id}</span
    >
  {:else}
    <kbd
      class="inline-kbd"
      class:in-text={inText}
      class:left={info.variant === "left"}
      class:right={info.variant === "right"}
      class:icon={!!icon}
      class:warn={!retrievedInfo}
      class:error={info.code > 1023}
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
{:else if display === "inline-keys" || display === "inline-text"}
  {@render inlineKbdSnippet()}
{/if}

<style lang="scss">
  kbd:not(.inline-kbd) {
    transition: color 250ms ease;
    padding-block: auto;
    height: 24px;

    &.in-text {
      display: inline-flex;
      vertical-align: middle;
      margin-block: auto;
      padding-block: revert;
    }
  }

  .warn:not(.error) {
    border-color: var(--md-sys-color-error);
    color: var(--md-sys-color-error);
  }

  .error {
    opacity: 0.6;
    text-decoration: line-through;
  }

  $variant-color: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 50%,
    transparent
  );

  .left,
  .right {
    background-color: transparent;

    &::before {
      position: absolute;
      inset: 0;
      outline: 2px dashed
        color-mix(in srgb, var(--bg-color), var(--md-sys-color-outline) 40%);
      outline-offset: -2px;
      border-radius: var(--border-radius);
      content: "";
    }
  }

  $cutoff: 60%;

  .left {
    background-image: linear-gradient(
      to right,
      var(--bg-color) $cutoff,
      transparent $cutoff
    );

    &::before {
      clip-path: inset(0 0 0 $cutoff);
    }
  }
  .right {
    background-image: linear-gradient(
      to left,
      var(--bg-color) $cutoff,
      transparent $cutoff
    );

    &::before {
      clip-path: inset(0 $cutoff 0 0);
    }
  }

  .inline-kbd {
    margin-inline-end: 2px;

    &.in-text.icon {
      translate: 0 -4em;
    }
  }

  :global(span) + .inline-kbd {
    margin-inline-start: 2px;
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
      -webkit-line-clamp: 2; /* number of lines to show */
      line-clamp: 2;
      overflow: hidden;
      font-style: italic;
      font-size: 12px;
      text-align: left;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
    }
  }
</style>
