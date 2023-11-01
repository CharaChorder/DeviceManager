<script lang="ts">
  import {getContext} from "svelte"
  import type {Writable} from "svelte/store"
  import type {VisualLayoutConfig} from "$lib/components/layout/visual-layout"
  import type {CompiledLayoutKey} from "$lib/serialization/visual-layout"
  import {layout} from "$lib/undo-redo.js"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"

  const {fontSize, margin, inactiveOpacity, inactiveScale, iconFontSize} =
    getContext<VisualLayoutConfig>("visual-layout-config")
  const activeLayer = getContext<Writable<number>>("active-layer")

  export let key: CompiledLayoutKey
  export let fontSizeMultiplier = 1

  export let middle: [number, number]
  export let pos: [number, number]
  export let rotate: number

  export let positions: [[number, number], [number, number], [number, number]]
</script>

{#each positions as position, layer}
  {@const {action: actionId, isApplied} = $layout[layer][key.id]}
  {@const {code, icon, id} = KEYMAP_CODES[actionId] ?? {code: actionId}}
  {@const isActive = layer === $activeLayer}
  {@const direction = [(middle[0] - margin * 3) / position[0], (middle[1] - margin * 3) / position[1]]}
  <text
    fill={isApplied ? "currentcolor" : "var(--md-sys-color-primary)"}
    font-weight={isApplied ? "" : "bold"}
    text-anchor="middle"
    alignment-baseline="central"
    x={pos[0] + middle[0] + (isApplied ? 0 : fontSize / 3)}
    y={pos[1] + middle[1]}
    font-size={fontSizeMultiplier * (icon ? iconFontSize : fontSize)}
    font-family={icon ? "Material Symbols Rounded" : undefined}
    opacity={isActive ? 1 : inactiveOpacity}
    style:scale={isActive ? 1 : inactiveScale}
    style:translate={isActive ? "0 0 0" : `${direction[0]}px ${direction[1]}px 0`}
    style:rotate="{rotate}deg"
  >
    {#if code !== 0}
      {icon || id || `0x${code.toString(16)}`}
    {/if}
    {#if !isApplied}
      <tspan>•</tspan>
    {/if}
  </text>
{/each}

<style lang="scss">
  $focus-transition: 10ms;
  $transition: 200ms;

  text {
    will-change: translate, scale;
    transform-origin: center;
    transform-box: fill-box;
    transition:
      fill #{$focus-transition} ease,
      opacity #{$transition} ease,
      translate #{$transition} ease,
      scale #{$transition} ease;
  }
</style>
