<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import LL from "$i18n/i18n-svelte";
  import Action from "$lib/components/Action.svelte";
  import type { MouseEventHandler } from "svelte/elements";

  let {
    id,
    onclick,
  }: { id: number | KeyInfo; onclick?: MouseEventHandler<HTMLButtonElement> } =
    $props();

  let key = $derived(
    (typeof id === "number" ? ($KEYMAP_CODES.get(id) ?? id) : id) as
      | number
      | KeyInfo,
  );
</script>

<button {onclick}>
  {#if typeof key === "object"}
    <div class="title">
      <b>
        {key.title || ""}
        {#if key.variant === "left"}
          (Left)
        {:else if key.variant === "right"}
          (Right)
        {/if}
      </b>
      {#if key.description}
        <i>{key.description}</i>
      {/if}
      {#if key.category?.name === "ASCII Macros"}
        <span class="warning">{@html $LL.actionSearch.SHIFT_WARNING()}</span>
      {/if}
      {#if key.category?.name === "CP-1252"}
        <span class="warning">{@html $LL.actionSearch.ALT_CODE_WARNING()}</span>
      {/if}
    </div>
    <Action display="keys" action={key} />
  {:else}
    <span class="key">0x{key.toString(16)}</span>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    border-radius: 8px;
    padding: 8px;

    width: 100%;
    height: auto;

    font-family: "Noto Sans Mono", monospace;

    @media not (forced-colors: active) {
      border: none;

      background: transparent;
      color: inherit;

      &:focus-visible {
        outline: none;
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface-variant);
      }
    }

    @media (forced-colors: active) {
      margin-block: 4px;
      border: 1px solid ButtonBorder;

      &:hover {
        color: ActiveText;
      }
    }
  }

  .title {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    text-align: start;
  }

  .warning {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--md-sys-color-error);

    > :global(.icon) {
      font-size: 16px;
    }
  }
</style>
