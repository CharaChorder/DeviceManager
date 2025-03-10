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
  let spanContainer: HTMLSpanElement | undefined = $state();
  let text: Text = (browser ? document.createTextNode("") : undefined)!;

  let textRenderer: TextRenderer | undefined = $state();

  $effect(() => {
    if (!textRenderer) return;
    textRenderer.showCursor = cursor;
  });

  // Only single inner text node is allowed, provided text will override
  // all existing text context if any.
  function innerText(node: HTMLElement, text: Text) {
    // Clear existing text if any.
    node.textContent = "";

    // Add the text node
    node.appendChild(text);

    return {
      destroy() {
        if (node.contains(text)) {
          text.remove();
        }
      },
    };
  }

  $effect(() => {
    if (!svg || !spanContainer) return;

    // Create a wrapper div and ensure correct positioning
    const container = svg.parentNode as HTMLElement;

    // Ensure the span has text for initial measurement
    if (!spanContainer.firstChild) {
      spanContainer.appendChild(text);
    }

    const player =
      replay instanceof ReplayPlayer ? replay : new ReplayPlayer(replay);
    replayPlayer = player;

    // Initialize renderer with span as the container
    const renderer = new TextRenderer(spanContainer, svg, text);

    const apply = () => {
      const newText =
        finalText ??
        (player.stepper.text.map((token) => token.text).join("") || "n");

      if (text.textContent !== newText) {
        text.textContent = newText;
      }
      // Force dimensions update before rendering
      if (spanContainer && svg) {
        const bounds = spanContainer.getBoundingClientRect();
        svg.setAttribute("width", bounds.width.toString());
        svg.setAttribute("height", bounds.height.toString());
      }

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
</script>

<!-- Wrapper to ensure proper positioning -->
<div class="char-recorder-wrapper">
  {#key replay}
    <!-- Text container for measurements -->
    <span bind:this={spanContainer} class="text-container" use:innerText={text}>
    </span>

    <!-- SVG overlaid on the text -->
    <svg bind:this={svg} class="svg-overlay"> </svg>
  {/key}

  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .char-recorder-wrapper {
    position: relative;
    width: 100%;
    display: block;
    text-align: left;
  }

  .text-container {
    position: relative;
    display: inline-block;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    min-height: 1.5em;
    visibility: hidden;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }

  .svg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    user-select: none;
  }

  .svg-overlay :global(text) {
    font-family: inherit;
    font-size: inherit;
    fill: currentColor;
    dominant-baseline: middle;
  }

  .svg-overlay :global(text[incorrect]) {
    fill: red;
  }

  .svg-overlay :global(rect) {
    fill: currentcolor;
  }

  .svg-overlay :global(.animated) {
    transition: transform 100ms ease;
  }
</style>
