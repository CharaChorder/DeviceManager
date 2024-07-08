<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import type { KeyInfo } from "$lib/serial/keymap-codes";
  import LL from "$i18n/i18n-svelte";
  import Action from "$lib/components/Action.svelte";

  export let id: number | KeyInfo;

  $: key = (typeof id === "number" ? KEYMAP_CODES.get(id) ?? id : id) as
    | number
    | KeyInfo;
</script>

<button on:click>
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
    gap: 4px;
    align-items: center;

    width: 100%;
    height: auto;
    margin: 0;
    padding: 8px;

    font-family: "Noto Sans Mono", monospace;
    border-radius: 8px;

    @media not (forced-colors: active) {
      color: inherit;

      background: transparent;
      border: none;

      &:focus-visible {
        color: var(--md-sys-color-on-surface-variant);
        background: var(--md-sys-color-surface-variant);
        outline: none;
      }
    }

    @media (forced-colors: active) {
      border: 1px solid ButtonBorder;
      margin-block: 4px;

      &:hover {
        color: ActiveText;
      }
    }
  }

  .title {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

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
