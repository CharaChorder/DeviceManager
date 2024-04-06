<script lang="ts">
  import { serialPort } from "$lib/serial/connection";
  import { action } from "$lib/title";
  import GenericLayout from "$lib/components/layout/GenericLayout.svelte";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { VisualLayout } from "$lib/serialization/visual-layout";
  import { fade } from "svelte/transition";

  $: device = $serialPort?.device ?? "ONE";
  const activeLayer = getContext<Writable<number>>("active-layer");

  const layers = [
    ["Numeric Layer", "123", 1],
    ["Primary Layer", "abc", 0],
    ["Function Layer", "function", 2],
  ] as const;

  const layouts = {
    ONE: () =>
      import("$lib/assets/layouts/one.yml").then(
        (it) => it.default as VisualLayout,
      ),
    LITE: () =>
      import("$lib/assets/layouts/lite.yml").then(
        (it) => it.default as VisualLayout,
      ),
    X: () =>
      import("$lib/assets/layouts/generic/103-key.yml").then(
        (it) => it.default as VisualLayout,
      ),
  };
</script>

<div class="container">
  {#await layouts[device]() then visualLayout}
    <fieldset transition:fade>
      {#each layers as [title, icon, value]}
        <button
          class="icon"
          use:action={{ title, shortcut: `alt+${value + 1}` }}
          on:click={() => ($activeLayer = value)}
          class:active={$activeLayer === value}
        >
          {icon}
        </button>
      {/each}
    </fieldset>

    <GenericLayout {visualLayout} />
  {/await}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
    margin-bottom: 96px;
  }

  fieldset {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 8px;

    border: none;
  }

  button.icon {
    cursor: pointer;

    z-index: 1;

    font-size: 24px;
    color: var(--md-sys-color-on-surface-variant);

    background: var(--md-sys-color-surface-variant);
    border: none;

    transition: all 250ms ease;

    &:nth-child(2) {
      z-index: 2;

      aspect-ratio: 1;

      font-size: 32px;

      border-radius: 50%;
    }

    &:first-child,
    &:last-child {
      aspect-ratio: unset;
      height: unset;
    }

    &:first-child {
      margin-inline-end: -8px;
      padding-inline: 4px 24px;
      border-radius: 16px 0 0 16px;
    }

    &:last-child {
      margin-inline-start: -8px;
      padding-inline: 24px 4px;
      border-radius: 0 16px 16px 0;
    }

    &.active {
      font-weight: 900;
      color: var(--md-sys-color-on-tertiary);
      background: var(--md-sys-color-tertiary);
    }
  }
</style>
