<script lang="ts">
  import {getContext} from "svelte"
  import type {Writable} from "svelte/store"
  import type {VisualLayoutConfig} from "$lib/components/layout/visual-layout"
  import type {CompiledLayoutKey} from "$lib/serialization/visual-layout"
  import {layout} from "$lib/undo-redo.js"
  import {osLayout} from "$lib/os-layout.js"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import {action} from "$lib/title"

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
  {@const {action: actionId, isApplied} = $layout[layer][key.id] ?? {action: 0, isApplied: true}}
  {@const {code, icon, id, display, title, keyCode, variant} = KEYMAP_CODES[actionId] ?? {code: actionId}}
  {@const dynamicMapping = keyCode && $osLayout.get(keyCode)}
  {@const tooltip =
    (title ?? id ?? `0x${code.toString(16)}`) +
    (variant === "left" ? " (left)" : variant === "right" ? " (right)" : "")}
  {@const isActive = layer === $activeLayer}
  {@const direction = [
    Math.sign(middle[0]) * (Math.abs(middle[0]) - margin * 3) * position[0],
    Math.sign(middle[1]) * (Math.abs(middle[1]) - margin * 3) * position[1],
  ]}
  {@const hasIcon = !dynamicMapping && !!icon}
  <text
    fill={isApplied ? "currentcolor" : "var(--md-sys-color-primary)"}
    font-weight={isApplied ? "" : "bold"}
    text-anchor="middle"
    alignment-baseline="central"
    x={pos[0] + middle[0] + (isApplied ? 0 : fontSize / 3)}
    y={pos[1] + middle[1]}
    font-size={fontSizeMultiplier * (hasIcon ? iconFontSize : fontSize)}
    font-family={hasIcon ? "Material Symbols Rounded" : undefined}
    opacity={isActive ? 1 : inactiveOpacity}
    style:scale={isActive ? 1 : inactiveScale}
    style:translate={isActive
      ? "0 0 0"
      : `${direction[0].toPrecision(2)}px ${direction[1].toPrecision(2)}px 0`}
    style:rotate="{rotate}deg"
    use:action={{title: tooltip}}
  >
    {#if code !== 0}
      {dynamicMapping || icon || display || id || `0x${code.toString(16)}`}
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
    user-select: none;
    transform-origin: center;
    transform-box: fill-box;
    transition:
      fill #{$focus-transition} ease,
      opacity #{$transition} ease,
      translate #{$transition} ease,
      scale #{$transition} ease;
  }

  text:focus-within {
    outline: none;
  }
</style>
