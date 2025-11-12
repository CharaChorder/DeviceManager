<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { VisualLayoutConfig } from "$lib/components/layout/visual-layout";
  import type { CompiledLayoutKey } from "$lib/serialization/visual-layout";
  import { layout } from "$lib/undo-redo.js";
  import { osLayout } from "$lib/os-layout.js";
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import { action } from "$lib/title";
  import { activeProfile, activeLayer } from "$lib/serial/connection";
  import { getContext } from "svelte";

  const { fontSize, margin, inactiveOpacity, inactiveScale, iconFontSize } =
    getContext<VisualLayoutConfig>("visual-layout-config");
  const currentAction = getContext<Writable<Set<number>> | undefined>(
    "highlight-action",
  );

  let {
    key,
    fontSizeMultiplier = 1,
    middle,
    pos,
    rotate,
    positions,
  }: {
    key: CompiledLayoutKey;
    fontSizeMultiplier?: number;
    middle: [number, number];
    pos: [number, number];
    rotate: number;
    positions: [[number, number], [number, number], [number, number]];
  } = $props();
</script>

{#each positions as position, layer}
  {@const { action: actionId, isApplied } = $layout[$activeProfile]?.[layer]?.[
    key.id
  ] ?? {
    action: 0,
    isApplied: true,
  }}
  {@const { code, icon, id, display, title, keyCode, variant } =
    $KEYMAP_CODES.get(actionId) ?? { code: actionId }}
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
    class:hidden={$currentAction?.has(actionId) === false}
    fill={isApplied ? "currentcolor" : "var(--md-sys-color-primary)"}
    font-weight={isApplied ? "" : "bold"}
    text-anchor="middle"
    alignment-baseline="central"
    x={pos[0] + middle[0] + (isApplied ? 0 : fontSize / 3)}
    y={pos[1] + middle[1]}
    font-size={fontSizeMultiplier * (hasIcon ? iconFontSize : fontSize)}
    font-family={hasIcon ? "Material Symbols Rounded" : undefined}
    opacity={isActive ? 1 : `var(--inactive-opacity, ${inactiveOpacity})`}
    style:scale={isActive ? 1 : `var(--inactive-scale, ${inactiveScale})`}
    style:translate={isActive
      ? "0 0 0"
      : `${direction[0]?.toPrecision(2)}px ${direction[1]?.toPrecision(2)}px 0`}
    style:rotate="{rotate}deg"
    use:action={{ title: tooltip }}
  >
    {#if code !== 0 && code != 1023}
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
    transform-box: fill-box;
    transform-origin: center;
    transition:
      fill #{$focus-transition} ease,
      opacity #{$transition} ease,
      translate #{$transition} ease,
      scale #{$transition} ease;
    will-change: translate, scale;
    user-select: none;

    @media (prefers-contrast: more) {
      --inactive-opacity: 0.8;
      --inactive-scale: 0.7;
    }
  }

  text:focus-within {
    outline: none;
  }

  text.hidden {
    opacity: 0.2;
  }
</style>
