<script>
  export let activeLayer = 0

  export let layout = [
    ["a", "b", "c"],
    ["d", "e", "f"],
    ["g", "h", "i"],
    ["j", "k", "l"],
  ]

  /** @type {'primary' | 'secondary' | 'tertiary'} */
  export let type = "primary"

  const layerNames = ["Primary Layer", "Number Layer", "Function Layer"]

  const virtualLayerMap = [1, 0, 2]
  const characterOffset = 8

  function offsetDistance(quadrant, layer, activeLayer) {
    const layerOffsetIndex = virtualLayerMap[layer] - virtualLayerMap[activeLayer]
    const layerOffset = quadrant > 2 ? -characterOffset : characterOffset
    return 25 * quadrant + layerOffsetIndex * layerOffset
  }

  function getKeyDescriptions(keys) {
    return keys.map((it, i) => (it ? `${it} (${layerNames[i]})` : "")).join("\n")
  }
</script>

<div class="radial {type}">
  {#each layout as keys, quadrant}
    <button title={getKeyDescriptions(keys)}>
      {#each keys as value, layer}
        <span
          class:active={virtualLayerMap[activeLayer] === virtualLayerMap[layer]}
          style="offset-distance: {offsetDistance(quadrant, layer, activeLayer)}%">{value}</span
        >
      {/each}
    </button>
  {/each}
</div>

<style lang="scss">
  @use "sass:math";

  $border-width: 18px;
  $gap: 6px;
  $size: 96;
  $offset: 14;
  $scale-difference: 0.2;

  .radial {
    position: relative;

    container: radial / size;

    width: #{$size * 1px};
    height: #{$size * 1px};

    transition: all 250ms ease;
  }

  span {
    $cr: math.div($size, 2) - 2 * $offset;

    will-change: scale, offset-distance;

    scale: 0.9;
    offset-path: path(
      "M#{math.div($size, 2)} #{$offset}A#{$cr} #{$cr} 0 1 1 #{math.div($size, 2)} #{$size - $offset}A#{$cr} #{$cr} 0 1 1 #{math.div($size, 2)} #{$offset}Z"
    );
    offset-rotate: 0deg;

    display: flex;
    grid-column: 1;
    grid-row: 1;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    font-size: 16px;

    opacity: 0.3;

    transition: scale 250ms ease, opacity 250ms ease, offset-distance 250ms ease;

    &.active {
      scale: 1;
      opacity: 1;
    }
  }

  button {
    cursor: pointer;

    position: absolute;

    display: grid;

    width: 100cqw;
    height: 100cqh;
    padding: 0;

    font-family: "Noto Sans Mono", monospace;
    font-size: 16px;
    font-weight: 900;
    color: var(--md-sys-color-on-surface-variant);

    background: var(--md-sys-color-surface-variant);
    border: none;

    transition: all 250ms ease;

    mask-image: url("$lib/assets/quater-ring.svg");
    mask-size: 100% 100%;

    &:active {
      color: var(--md-sys-color-on-tertiary);
      background: var(--md-sys-color-tertiary);
    }

    &:nth-child(1) {
      clip-path: polygon(50% 50%, 0 0, 100% 0);
    }

    &:nth-child(2) {
      clip-path: polygon(50% 50%, 100% 0, 100% 100%);
    }

    &:nth-child(3) {
      clip-path: polygon(50% 50%, 0 100%, 100% 100%);
    }

    &:nth-child(4) {
      clip-path: polygon(50% 50%, 0 0, 0 100%);
    }
  }
</style>
