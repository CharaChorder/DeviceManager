<script lang="ts">
  import type {CompiledLayoutKey} from "$lib/serialization/visual-layout"
  import {getContext} from "svelte"
  import type {VisualLayoutConfig} from "./visual-layout.js"
  import KeyText from "$lib/components/layout/KeyText.svelte"

  const {scale, margin, strokeWidth} = getContext<VisualLayoutConfig>("visual-layout-config")
  export let i: number
  export let key: CompiledLayoutKey

  $: posX = key.pos[0] * scale
  $: posY = key.pos[1] * scale
  $: sizeX = key.size[0] * scale
  $: sizeY = key.size[1] * scale
</script>

<g class="key-group" on:click on:keypress on:focusin role="button" tabindex={i + 1}>
  {#if key.shape === "square"}
    <rect
      x={posX + margin}
      y={posY + margin}
      rx={key.cornerRadius * scale}
      width={sizeX - margin * 2}
      height={sizeY - margin * 2}
      stroke-width={strokeWidth}
    />
    <KeyText
      {key}
      middle={[sizeX / 2, sizeY / 2]}
      pos={[posX, posY]}
      rotate={-key.rotate}
      positions={[
        [-1, 1],
        [-1, -1],
        [1, -1],
      ]}
    />
  {:else if key.shape === "quarter-circle"}
    {@const innerMargin = margin / 2}
    {@const r1 = sizeX / 2 - margin}
    {@const p1 = r1 - innerMargin}
    {@const r2 = r1 - sizeY + innerMargin * 2}
    {@const p2 = r2 - innerMargin}
    {@const multiplier = 1.25}
    <g style:transform="rotateZ({key.rotate}deg) translate({innerMargin}px, {innerMargin}px)">
      <path
        d="M{posX + p1},{posY} a{r1},{r1} 0 0,1 {-p1},{p1} l0,{-(p1 - p2)} a{r2},{r2} 0 0,0 {p2},{-p2}z"
      />
      <KeyText
        {key}
        middle={[sizeY - margin * 2, sizeY - margin * 2]}
        pos={[posX, posY]}
        rotate={-key.rotate}
        fontSizeMultiplier={multiplier}
        positions={[
          [-0.5, -0.5],
          [0.5, -0.5],
          [-0.5, 0.5],
        ]}
      />
    </g>
  {/if}
</g>

<style lang="scss">
  $focus-transition: 10ms;
  $transition: 200ms;

  rect {
    transform-origin: center;
    transform-box: fill-box;
  }

  g {
    transform-origin: top left;
    transform-box: fill-box;
  }

  path,
  rect {
    fill: var(--md-sys-color-background);
    fill-opacity: 0;
    stroke: currentcolor;
  }

  path {
    fill: currentcolor;
    fill-opacity: 0;
    stroke-opacity: 0.3;
  }

  g:hover {
    cursor: default;
    opacity: 0.6;
    transition: opacity #{$transition} ease;
  }

  g:focus-within {
    color: var(--md-sys-color-primary);
    outline: none;

    > path,
    > rect {
      fill: currentcolor;
      fill-opacity: 0.2;
    }
  }
</style>
