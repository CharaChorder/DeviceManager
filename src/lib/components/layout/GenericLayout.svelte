<script lang="ts">
  import { compileLayout } from "$lib/serialization/visual-layout";
  import type {
    VisualLayout,
    CompiledLayoutKey,
  } from "$lib/serialization/visual-layout";
  import { deviceLayout } from "$lib/serial/connection";
  import { dev } from "$app/environment";
  import ActionSelector from "$lib/components/layout/ActionSelector.svelte";
  import { get } from "svelte/store";
  import type { Writable } from "svelte/store";
  import KeyboardKey from "$lib/components/layout/KeyboardKey.svelte";
  import { getContext } from "svelte";
  import type { VisualLayoutConfig } from "./visual-layout.js";
  import { changes, ChangeType, layout } from "$lib/undo-redo";
  import { fly } from "svelte/transition";
  import { expoOut } from "svelte/easing";

  const { scale, margin, strokeWidth, fontSize, iconFontSize } =
    getContext<VisualLayoutConfig>("visual-layout-config");
  const activeLayer = getContext<Writable<number>>("active-layer");

  if (dev) {
    // you have absolutely no idea what a difference this makes for performance
    console.assert(scale % 1 === 0, "Scale must be an integer");
    console.assert((scale / 2) % 1 === 0, "Scale must be divisible by 2");
    console.assert(strokeWidth % 1 === 0, "Stroke must be an integer");
    console.assert(margin % 1 === 0, "Margin must be an integer");
    console.assert(fontSize % 1 === 0, "Font size must be an integer");
    console.assert(iconFontSize % 1 === 0, "Icon font size must be an integer");
  }

  export let visualLayout: VisualLayout;
  $: layoutInfo = compileLayout(visualLayout);

  function getCenter(key: CompiledLayoutKey): [x: number, y: number] {
    return [key.pos[0] + key.size[0] / 2, key.pos[1] + key.size[1] / 2];
  }

  function getDistance(a: CompiledLayoutKey, b: CompiledLayoutKey) {
    const x1 = a.pos[0] + margin;
    const y1 = a.pos[1] + margin;
    const x1b = x1 + a.size[0] - margin;
    const y1b = y1 + a.size[1] - margin;
    const x2 = b.pos[0] + margin;
    const y2 = b.pos[1] + margin;
    const x2b = x2 + b.size[0] - margin;
    const y2b = y2 + b.size[1] - margin;

    const left = x2b < x1;
    const right = x1b < x2;
    const bottom = y2b < y1;
    const top = y1b < y2;

    return top && left
      ? Math.sqrt((x1 - x2b) ** 2 + (y1b - y2) ** 2)
      : left && bottom
        ? Math.sqrt((x1 - x2b) ** 2 + (y1 - y2b) ** 2)
        : bottom && right
          ? Math.sqrt((x1b - x2) ** 2 + (y1 - y2b) ** 2)
          : right && top
            ? Math.sqrt((x1b - x2) ** 2 + (y1b - y2) ** 2)
            : left
              ? x1 - x2b
              : right
                ? x2 - x1b
                : bottom
                  ? y1 - y2b
                  : top
                    ? y2 - y1b
                    : 0;
  }

  function navigate(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)
      return;

    let wantedAngle: number;
    const angleThreshold = Math.PI;

    if (event.key === "ArrowUp") wantedAngle = Math.PI;
    else if (event.key === "ArrowDown") wantedAngle = 0;
    else if (event.key === "ArrowRight") wantedAngle = Math.PI / 2;
    else if (event.key === "ArrowLeft") wantedAngle = -Math.PI / 2;
    else return;

    event.preventDefault();
    if (!focusKey) (groupParent.firstChild as SVGGElement).focus();
    const [focusX, focusY] = getCenter(focusKey);

    let bestDistance = Infinity;
    let bestCandidate = 0;
    let isOptimalAngle = false;

    for (const [i, key] of layoutInfo.keys.entries()) {
      if (key === focusKey) continue;
      const [keyX, keyY] = getCenter(key);
      const deltaX = keyX - focusX;
      const deltaY = keyY - focusY;
      const angle = Math.atan2(deltaX, deltaY);
      const distance = getDistance(key, focusKey);

      const angleDelta = Math.abs(wantedAngle - angle);

      if (
        isOptimalAngle
          ? angleDelta > Number.EPSILON
          : angleDelta >= angleThreshold
      )
        continue;
      if (distance > bestDistance) continue;

      bestDistance = distance;
      bestCandidate = i;
      isOptimalAngle = angleDelta <= Number.EPSILON;
    }

    const node = groupParent.children.item(bestCandidate);
    if (node instanceof SVGGElement) {
      node.focus();
    }
  }

  function edit(index: number) {
    const keyInfo = layoutInfo.keys[index];
    if (!keyInfo) return;
    const clickedGroup = groupParent.children.item(index) as SVGGElement;
    const nextAction = get(layout)[get(activeLayer)]?.[keyInfo.id];
    const currentAction = get(deviceLayout)[get(activeLayer)]?.[keyInfo.id];
    if (!nextAction || !currentAction) return;
    const component = new ActionSelector({
      target: document.body,
      props: {
        currentAction,
        nextAction: nextAction.isApplied ? undefined : nextAction.action,
      },
    });
    const dialog = document.querySelector("dialog > div") as HTMLDivElement;
    const backdrop = document.querySelector("dialog") as HTMLDialogElement;
    const dialogRect = dialog.getBoundingClientRect();
    const groupRect = clickedGroup.getBoundingClientRect();

    const scale = 0.5;
    const dialogScale = `${1 - scale * (1 - groupRect.width / dialogRect.width)} ${
      1 - scale * (1 - groupRect.height / dialogRect.height)
    }`;
    const dialogTranslate = `${scale * (groupRect.x - dialogRect.x)}px ${
      scale * (groupRect.y - dialogRect.y)
    }px`;

    const duration = 150;
    const options = { duration, easing: "ease" };
    const dialogAnimation = dialog.animate(
      [
        { scale: dialogScale, translate: dialogTranslate },
        { translate: "0 0", scale: "1" },
      ],
      options,
    );
    const backdropAnimation = backdrop.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      options,
    );

    async function closed() {
      dialogAnimation.reverse();
      backdropAnimation.reverse();

      await dialogAnimation.finished;

      component.$destroy();
    }

    component.$on("close", closed);
    component.$on("select", ({ detail }) => {
      changes.update((changes) => {
        changes.push({
          type: ChangeType.Layout,
          id: keyInfo.id,
          layer: get(activeLayer),
          action: detail,
        });
        return changes;
      });
      closed();
    });
  }

  let focusKey: CompiledLayoutKey;
  let groupParent: SVGElement;
</script>

<svelte:window on:keydown={navigate} />

<svg
  class="print"
  viewBox="0 0 {layoutInfo.size[0] * scale} {layoutInfo.size[1] * scale}"
  bind:this={groupParent}
  transition:fly={{ y: 48, easing: expoOut }}
>
  {#each layoutInfo.keys as key, i}
    <KeyboardKey
      {i}
      {key}
      on:focusin={() => (focusKey = key)}
      on:click={() => edit(i)}
      on:keypress={({ key }) => {
        if (key === "Enter") {
          edit(i);
        }
      }}
    />
  {/each}
</svg>

<style lang="scss">
  svg {
    overflow: visible;
    grid-area: "d";
    width: calc(min(100%, 35cm));
    max-height: calc(100% - 170px);
  }
</style>
