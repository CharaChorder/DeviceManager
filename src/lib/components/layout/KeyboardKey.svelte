<script lang="ts">
  import type { CompiledLayoutKey } from "$lib/serialization/visual-layout";
  import { getContext } from "svelte";
  import type { VisualLayoutConfig } from "./visual-layout.js";
  import KeyText from "$lib/components/layout/KeyText.svelte";
  import type {
    FocusEventHandler,
    KeyboardEventHandler,
    MouseEventHandler,
  } from "svelte/elements";

  const { scale, margin, strokeWidth } = getContext<VisualLayoutConfig>(
    "visual-layout-config",
  );

  let {
    i,
    key,
    onclick,
    onkeypress,
    onfocusin,
  }: {
    i: number;
    key: CompiledLayoutKey;
    onclick: MouseEventHandler<SVGGElement>;
    onkeypress: KeyboardEventHandler<SVGGElement>;
    onfocusin: FocusEventHandler<SVGGElement>;
  } = $props();

  let posX = $derived(key.pos[0] * scale);
  let posY = $derived(key.pos[1] * scale);
  let sizeX = $derived(key.size[0] * scale);
  let sizeY = $derived(key.size[1] * scale);
</script>

<g
  class="key-group"
  {onclick}
  {onkeypress}
  {onfocusin}
  role="button"
  tabindex={i + 1}
>
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

    {@const rotateRad = (key.rotate + 45) * (Math.PI / 180)}
    {@const rotX =
      Math.round(
        (Math.abs(Math.cos(rotateRad - Math.PI / 2)) + Number.EPSILON) * 100,
      ) / 100}
    {@const rotY =
      Math.round(
        (Math.abs(Math.sin(rotateRad - Math.PI / 2)) + Number.EPSILON) * 100,
      ) / 100}

    {@const rc = r1 - (r1 - r2) / 2}
    {@const middleX = Math.cos(rotateRad) * rc}
    {@const middleY = Math.sin(rotateRad) * rc}
    <path
      style:transform="rotateZ({key.rotate}deg) translate({innerMargin}px, {innerMargin}px)"
      d="M{posX + p1},{posY} a{r1},{r1} 0 0,1 {-p1},{p1} l0,{-(
        p1 - p2
      )} a{r2},{r2} 0 0,0 {p2},{-p2}z"
    />
    <KeyText
      {key}
      middle={[middleX, middleY]}
      pos={[posX, posY]}
      rotate={0}
      fontSizeMultiplier={multiplier}
      positions={[
        [-rotY, -rotX],
        [-rotX, -rotY],
        [rotX, rotY],
      ]}
    />
  {/if}
</g>

<style lang="scss">
  $focus-transition: 10ms;
  $transition: 200ms;

  rect {
    transform-origin: center;
    transform-box: fill-box;
  }

  path,
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
