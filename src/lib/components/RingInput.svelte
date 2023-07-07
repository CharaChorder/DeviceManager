<script>
  import {layout} from "$lib/serial/connection.js"
  import {ACTION_MAP} from "$lib/serial/webserial/constants/action-map.js"
  import keySymbols from "$lib/assets/key-symbols.json"

  export let activeLayer = 0

  /** @type {{d: number, n: number, w: number, e: number, s: number}} */
  export let keys

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
    return keys.map(([, it], i) => (it ? `${it} (${layerNames[i]})` : "")).join("\n")
  }

  /**
   * @param id {number}
   * @param layout {[number[], number[], number[]]}
   * @returns [string, string][]
   */
  function getActions(id, layout) {
    return Array.from({length: 3}).map((_, i) => {
      const actionId = layout?.[i][id]
      return actionId !== undefined
        ? [keySymbols[ACTION_MAP[actionId]], ACTION_MAP[actionId]]
        : ["❓", undefined]
    })
  }
</script>

<div class="radial {type}">
  {#each [keys.n, keys.e, keys.s, keys.w] as id, quadrant}
    {@const actions = getActions(id, $layout)}
    <button title={getKeyDescriptions(actions)}>
      {#each actions as [value, raw], layer}
        {#if value || raw}
          <span
            class:active={virtualLayerMap[activeLayer] === virtualLayerMap[layer]}
            style="offset-distance: {offsetDistance(quadrant, layer, activeLayer)}%">{value || raw}</span
          >
        {/if}
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
    user-select: none;

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

    opacity: 0.2;

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

  .secondary > button {
    filter: brightness(80%) contrast(120%);
  }

  .tertiary > button {
    filter: brightness(80%) contrast(110%);
  }
</style>
