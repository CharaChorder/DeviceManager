<script lang="ts">
  import { actionTooltip } from "$lib/title";

  let {
    onchange,
    value,
    variant,
  }: {
    value: boolean;
    variant: "start" | "end";
    onchange: (
      event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ) => void;
  } = $props();
</script>

{#snippet tooltip()}
  {#if value}
    {#if variant === "start"}
      <b>Remove</b> preceding space
    {:else}
      <b>Add</b> trailing space
    {/if}
  {:else if variant === "start"}
    <b>Keep</b> preceding space
  {:else}
    <b>Add</b> trailing space
  {/if}
{/snippet}
<label class="autospace" {@attach actionTooltip(tooltip)}
  ><span class="icon">space_bar</span><input
    checked={!value}
    {onchange}
    type="checkbox"
  /></label
>

<style lang="scss">
  label.autospace {
    display: inline-flex;
    vertical-align: middle;
    margin-inline: 8px;
    border-radius: 4px;
    background: var(--md-sys-color-tertiary-container);
    padding-inline: 0;
    height: 1em;
    color: var(--md-sys-color-on-tertiary-container);
    font-size: 1.3em;

    &:has(:checked) {
      opacity: var(--auto-space-show, 0);
    }
  }
</style>
