<script>
  export let activeLayer = 1
  export let layers = 3

  export let layout = [
    ["a", "b", "c"],
    ["d", "e", "f"],
    ["g", "h", "i"],
    ["j", "k", "l"],
  ]

  /**
   * @param index {number}
   * @returns number
   */
  function calcLayerPosition(index) {
    return index - activeLayer
  }
</script>

<div class="radial">
  {#each Array.from({length: layers}) as _, i}
    <!--suppress Stylelint -->
    <div
      class="layer"
      style="translate: -50% -50% {((i - activeLayer + 1) % 2) - 1}px; filter: brightness({1 -
        Math.log(1 + Math.abs(i - activeLayer))})"
      class:active={activeLayer === i}
    >
      <button on:click={() => (activeLayer = (activeLayer + 1) % layers)}>{i}</button>
      <button>{i}</button>
      <button>{i}</button>
      <button>{i}</button>
    </div>
  {/each}
</div>

<style lang="scss">
  $border-width: 18px;
  $gap: 6px;
  $size: 96px;
  $scale-difference: 0.2;

  .radial {
    position: relative;
    width: 0;
    height: 0;
    perspective: 3px;
  }

  .layer {
    pointer-events: none;

    position: absolute;
    z-index: -1;
    transform-style: preserve-3d;
    translate: -50% -50% 0;

    container: radial / size;

    width: $size;
    height: $size;

    transition: all 250ms ease;
  }

  .layer.active {
    pointer-events: all;
    z-index: 1;
  }

  button {
    cursor: pointer;

    position: absolute;

    display: flex;

    width: 100cqw;
    height: 100cqh;
    padding: 5px;

    font-family: "Noto Sans Mono", monospace;
    font-size: 16px;
    font-weight: 900;
    color: var(--md-sys-color-on-surface-variant);

    background: var(--md-sys-color-surface-variant);
    border: none;

    transition: all 250ms ease;

    mask-image: url("$lib/assets/quater-ring.svg");
    mask-size: 100% 100%;

    &:hover {
      color: var(--md-sys-color-on-tertiary);
      background: var(--md-sys-color-tertiary);
    }

    &:nth-child(1) {
      align-items: flex-start;
      justify-content: center;
      clip-path: polygon(50% 50%, 0 0, 100% 0);
    }

    &:nth-child(2) {
      align-items: center;
      justify-content: flex-end;
      clip-path: polygon(50% 50%, 100% 0, 100% 100%);
    }

    &:nth-child(3) {
      align-items: flex-end;
      justify-content: center;
      clip-path: polygon(50% 50%, 0 100%, 100% 100%);
    }

    &:nth-child(4) {
      align-items: center;
      justify-content: flex-start;
      clip-path: polygon(50% 50%, 0 0, 0 100%);
    }
  }
</style>
