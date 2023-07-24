<script>
  import {serialPort} from "$lib/serial/connection"
  import LayoutCC1 from "$lib/components/layout/LayoutCC1.svelte"

  $: device = $serialPort?.device ?? "ONE"
  let activeLayer = 0
</script>

<div>
  <select bind:value={device}>
    <option value="ONE">CC1</option>
    <option value="LITE">Lite</option>
  </select>

  <fieldset>
    {#each [["Numeric Layer", "123", 1], ["Primary Layer", "abc", 0], ["Function Layer", "function", 2]] as [title, icon, value]}
      <button
        {title}
        class="icon"
        on:click={() => (activeLayer = value)}
        class:active={activeLayer === value}
      >
        {icon}
      </button>
    {/each}
  </fieldset>

  {#if device === "ONE"}
    <LayoutCC1 bind:activeLayer />
  {:else}
    <p>Unsupported device ({$serialPort?.device})</p>
  {/if}
</div>

<style lang="scss">
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

    &:first-child {
      padding-inline-end: 16px;
      border-radius: 16px 0 0 16px;
    }

    &:last-child {
      padding-inline-start: 16px;
      border-radius: 0 16px 16px 0;
    }

    &.active {
      font-weight: 900;
      color: var(--md-sys-color-on-tertiary);
      background: var(--md-sys-color-tertiary);
    }
  }
</style>
