<script>
  import RingInput from "$lib/components/RingInput.svelte"
  import layout from "$lib/assets/layouts/cc1.yml"

  let activeLayer = 0
</script>

<div>
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

  <div class="col layout" style="gap: 0">
    <div class="row" style="gap: 156px">
      <div class="row">
        <RingInput {activeLayer} keys={{d: 30, e: 31, n: 32, w: 33, s: 34}} type="tertiary" />
        <div class="col">
          <RingInput {activeLayer} keys={{d: 25, e: 26, n: 27, w: 28, s: 29}} />
          <RingInput {activeLayer} keys={{d: 40, e: 41, n: 42, w: 43, s: 44}} type="secondary" />
        </div>
        <div class="col">
          <RingInput {activeLayer} keys={{d: 20, e: 21, n: 22, w: 23, s: 24}} />
          <RingInput {activeLayer} keys={{d: 35, e: 36, n: 37, w: 38, s: 39}} type="secondary" />
        </div>
        <RingInput {activeLayer} keys={{d: 15, e: 16, n: 17, w: 18, s: 19}} />
      </div>

      <div class="row">
        <RingInput {activeLayer} keys={{d: 60, w: 61, n: 62, e: 63, s: 64}} />
        <div class="col">
          <RingInput {activeLayer} keys={{d: 65, w: 66, n: 67, e: 68, s: 69}} />
          <RingInput {activeLayer} keys={{d: 80, w: 81, n: 82, e: 83, s: 84}} />
        </div>
        <div class="col">
          <RingInput {activeLayer} keys={{d: 70, w: 71, n: 72, e: 73, s: 74}} />
          <RingInput {activeLayer} keys={{d: 85, w: 86, n: 87, e: 88, s: 89}} />
        </div>
        <RingInput {activeLayer} keys={{d: 75, w: 76, n: 77, e: 78, s: 79}} />
      </div>
    </div>
    <div class="row" style="gap: 48px; margin-top: -32px">
      <RingInput {activeLayer} keys={{d: 10, e: 11, n: 12, w: 13, s: 14}} />
      <RingInput {activeLayer} keys={{d: 55, w: 56, n: 57, e: 58, s: 59}} />
    </div>
    <div class="row" style="gap: 160px">
      <RingInput {activeLayer} keys={{d: 5, e: 6, n: 7, w: 8, s: 9}} />
      <RingInput {activeLayer} keys={{d: 50, w: 51, n: 52, e: 53, s: 54}} />
    </div>
    <div class="row" style="gap: 320px; margin-top: -12px">
      <RingInput {activeLayer} keys={{d: 0, e: 1, n: 2, w: 3, s: 4}} type="secondary" />
      <RingInput {activeLayer} keys={{d: 45, w: 46, n: 47, e: 48, s: 49}} type="secondary" />
    </div>
  </div>
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
