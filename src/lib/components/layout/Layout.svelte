<script lang="ts">
  import {deviceLayout, serialPort} from "$lib/serial/connection"
  import {action} from "$lib/title"
  import GenericLayout from "$lib/components/layout/GenericLayout.svelte"
  import {getContext} from "svelte"
  import type {Writable} from "svelte/store"
  import {csvLayoutToJson, isCsvLayout} from "$lib/compat/legacy-layout"
  import type {CharaLayoutFile} from "$lib/share/chara-file"

  export let layoutOverride: "ONE" | "LITE" | undefined = undefined

  $: device = $serialPort?.device ?? "ONE"
  const activeLayer = getContext<Writable<number>>("active-layer")

  const layers = [
    ["Numeric Layer", "123", 1],
    ["Primary Layer", "abc", 0],
    ["Function Layer", "function", 2],
  ] as const

  const layouts = {
    ONE: () => import("$lib/assets/layouts/one.yml"),
    LITE: () => import("$lib/assets/layouts/lite.yml"),
  }

  async function importLayout() {
    const file = await fileInput.files?.item(0)?.text()
    if (!file) return
    const importedLayout = isCsvLayout(file) ? csvLayoutToJson(file) : (JSON.parse(file) as CharaLayoutFile)
    if (importedLayout.type === "layout" && importedLayout.charaVersion === 1)
      $deviceLayout = importedLayout.layout
  }

  let fileInput: HTMLInputElement
</script>

<div class="container">
  <fieldset>
    {#each layers as [title, icon, value]}
      <button
        class="icon"
        use:action={{title, shortcut: `alt+${value + 1}`}}
        on:click={() => ($activeLayer = value)}
        class:active={$activeLayer === value}
      >
        {icon}
      </button>
    {/each}
  </fieldset>

  {#await layouts[layoutOverride || device]() then { default: visualLayout }}
    <GenericLayout {visualLayout} />
  {/await}
</div>

<style lang="scss">
  .controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

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

    margin-block-end: -36px;
    padding: 0;

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
      outline: 8px solid var(--md-sys-color-background);
    }

    &:first-child,
    &:last-child {
      aspect-ratio: unset;
      height: unset;
    }

    &:first-child {
      padding-inline: 4px 16px;
      border-radius: 16px 0 0 16px;
    }

    &:last-child {
      padding-inline: 16px 4px;
      border-radius: 0 16px 16px 0;
    }

    &.active {
      font-weight: 900;
      color: var(--md-sys-color-on-tertiary);
      background: var(--md-sys-color-tertiary);
    }
  }
</style>
