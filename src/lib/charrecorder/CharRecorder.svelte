<script lang="ts">
  import { browser } from "$app/environment";
  import { ReplayPlayer } from "./core/player.js";
  import { ReplayStepper } from "./core/step.js";
  import type { Replay } from "./core/types.js";
  import { TextRenderer } from "./renderer/renderer.js";
  import { setContext, type Snippet } from "svelte";

  let {
    replay,
    cursor = false,
    keys = false,
    children,
    ondone,
  }: {
    replay: ReplayPlayer | Replay;
    cursor?: boolean;
    keys?: boolean;
    children?: Snippet;
    ondone?: () => void;
  } = $props();

  let replayPlayer: ReplayPlayer | undefined = $state();
  setContext("replay", {
    get player() {
      return replayPlayer;
    },
  });

  let finalText = $derived(
    replay instanceof ReplayPlayer
      ? undefined
      : new ReplayStepper(replay.keys).text.map((token) => token.text).join(""),
  );

  let svg: SVGSVGElement | undefined = $state();
  let text: Text = (browser ? document.createTextNode("") : undefined)!;

  let textRenderer: TextRenderer | undefined = $state();

  $effect(() => {
    if (!textRenderer) return;
    textRenderer.showCursor = cursor;
  });

  $effect(() => {
    if (!svg || !text) return;
    const player =
      replay instanceof ReplayPlayer ? replay : new ReplayPlayer(replay);
    replayPlayer = player;

    const renderer = new TextRenderer(svg.parentNode as HTMLElement, svg, text);
    const apply = () => {
      text.textContent =
        finalText ??
        (player.stepper.text.map((token) => token.text).join("") || "n");
      renderer.text = player.stepper.text;
      renderer.cursor = player.stepper.cursor;
      if (keys) {
        renderer.held = player.stepper.held;
      }
    };
    const unsubscribePlayer = player.subscribe(apply);
    textRenderer = renderer;

    player.onDone = ondone;
    player.start();
    apply();
    setTimeout(() => {
      renderer.animated = true;
    });
    return () => {
      unsubscribePlayer();
      player?.destroy();
    };
  });

  export function innerText(node: HTMLElement, text: Text) {
    node.appendChild(text);
    return {
      destroy() {
        text.remove();
      },
    };
  }
</script>

{#key replay}
  <svg bind:this={svg}></svg>
  {#if browser}
    <span use:innerText={text}></span>
  {:else if !(replay instanceof ReplayPlayer)}
    {finalText}
  {/if}
{/key}

{#if children}
  {@render children()}
{/if}

<style>
  :global(*):has(svg) {
    position: relative;
  }

  span {
    opacity: 0;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    user-select: none;
  }

  svg > :global(text) {
    font-size: inherit;
    font-family: inherit;
    fill: currentColor;
    dominant-baseline: middle;
  }

  svg > :global(text[incorrect]) {
    fill: red;
  }

  svg > :global(rect) {
    fill: currentcolor;
  }

  svg > :global(.animated) {
    transition: transform 100ms ease;
  }
</style>
