<script>
  import RingInput from "$lib/components/RingInput.svelte"

  let activeLayer = 0
</script>

<fieldset>
  {#each [["Numeric Layer", "123", 1], ["Primary Layer", "abc", 0], ["Function Layer", "function", 2]] as [title, icon, value]}
    <button {title} class="icon" on:click={() => (activeLayer = value)} class:active={activeLayer === value}>
      {icon}
    </button>
  {/each}
</fieldset>

<div class="col" style="gap: 0">
  <div class="row" style="gap: 156px">
    <div class="row">
      <RingInput {activeLayer} />
      <div class="col">
        <RingInput {activeLayer} />
        <RingInput {activeLayer} />
      </div>
      <div class="col">
        <RingInput {activeLayer} />
        <RingInput {activeLayer} />
      </div>
      <RingInput {activeLayer} />
    </div>

    <div class="row">
      <RingInput {activeLayer} />
      <div class="col">
        <RingInput {activeLayer} />
        <RingInput {activeLayer} />
      </div>
      <div class="col">
        <RingInput {activeLayer} />
        <RingInput {activeLayer} />
      </div>
      <RingInput {activeLayer} />
    </div>
  </div>
  <div class="row" style="gap: 48px; margin-top: -32px">
    <RingInput {activeLayer} />
    <RingInput {activeLayer} />
  </div>
  <div class="row" style="gap: 160px">
    <RingInput {activeLayer} />
    <RingInput {activeLayer} />
  </div>
  <div class="row" style="gap: 320px; margin-top: -12px">
    <RingInput {activeLayer} />
    <RingInput {activeLayer} />
  </div>
</div>

<style lang="scss">
  fieldset {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 16px;
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

  .row,
  .col {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .row {
    flex-direction: row;
  }

  .col {
    flex-direction: column;
  }
</style>
