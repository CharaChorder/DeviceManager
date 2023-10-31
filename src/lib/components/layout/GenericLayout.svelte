<script lang="ts">
  import rawLayout from "$lib/assets/layouts/lite.yml"
  import {compileLayout} from "$lib/serialization/visual-layout"
  import type {VisualLayout, CompiledLayoutKey} from "$lib/serialization/visual-layout"
  import {changes, layout} from "$lib/serial/connection"
  import type {Change} from "$lib/serial/connection"
  import {dev} from "$app/environment"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes.js"
  import type {KeyInfo} from "$lib/serial/keymap-codes.js"
  import ActionSelector from "$lib/components/layout/ActionSelector.svelte"
  import {get} from "svelte/store"
  import type {CharaLayout} from "$lib/serialization/layout"

  const scale = 50
  export let inactiveScale = 0.6
  export let inactiveOpacity = 0.4
  export let strokeWidth = 1
  export let margin = 5
  export let fontSize = 9
  export let iconFontSize = 14
  export let activeLayer: number

  if (dev) {
    // you have absolutely no idea what a difference this makes for performance
    console.assert(scale % 1 === 0, "Scale must be an integer")
    console.assert((scale / 2) % 1 === 0, "Scale must be divisible by 2")
    console.assert(strokeWidth % 1 === 0, "Stroke must be an integer")
    console.assert(margin % 1 === 0, "Margin must be an integer")
    console.assert(fontSize % 1 === 0, "Font size must be an integer")
    console.assert(iconFontSize % 1 === 0, "Icon font size must be an integer")
  }

  const layoutInfo = compileLayout(rawLayout as VisualLayout)

  function getCenter(key: CompiledLayoutKey): [x: number, y: number] {
    return [key.pos[0] + key.size[0] / 2, key.pos[1] + key.size[1] / 2]
  }

  function getDistance(a: CompiledLayoutKey, b: CompiledLayoutKey) {
    const x1 = a.pos[0] + margin
    const y1 = a.pos[1] + margin
    const x1b = x1 + a.size[0] - margin
    const y1b = y1 + a.size[1] - margin
    const x2 = b.pos[0] + margin
    const y2 = b.pos[1] + margin
    const x2b = x2 + b.size[0] - margin
    const y2b = y2 + b.size[1] - margin

    const left = x2b < x1
    const right = x1b < x2
    const bottom = y2b < y1
    const top = y1b < y2

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
      : 0
  }

  function navigate(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) return

    let wantedAngle: number
    const angleThreshold = Math.PI

    if (event.key === "ArrowUp") wantedAngle = Math.PI
    else if (event.key === "ArrowDown") wantedAngle = 0
    else if (event.key === "ArrowRight") wantedAngle = Math.PI / 2
    else if (event.key === "ArrowLeft") wantedAngle = -Math.PI / 2
    else return

    event.preventDefault()
    if (!focusKey) (groupParent.firstChild as SVGGElement).focus()
    const [focusX, focusY] = getCenter(focusKey)

    let bestDistance = Infinity
    let bestCandidate = 0
    let isOptimalAngle = false

    for (const [i, key] of layoutInfo.keys.entries()) {
      if (key === focusKey) continue
      const [keyX, keyY] = getCenter(key)
      const deltaX = keyX - focusX
      const deltaY = keyY - focusY
      const angle = Math.atan2(deltaX, deltaY)
      const distance = getDistance(key, focusKey)

      const angleDelta = Math.abs(wantedAngle - angle)

      if (isOptimalAngle ? angleDelta > Number.EPSILON : angleDelta >= angleThreshold) continue
      if (distance > bestDistance) continue

      bestDistance = distance
      bestCandidate = i
      isOptimalAngle = angleDelta <= Number.EPSILON
    }

    const node = groupParent.children.item(bestCandidate)
    if (node instanceof SVGGElement) {
      node.focus()
    }
  }

  function getActions(layer: number, id: number, layout: CharaLayout, changes: Change[]): [KeyInfo, boolean] {
    const actionId = layout?.[layer][id]
    const changedId = changes.findLast(it => it?.layout?.[layer]?.[id] !== undefined)?.layout?.[layer]?.[id]
    if (changedId !== undefined) {
      return [KEYMAP_CODES[changedId], true]
    } else {
      return [KEYMAP_CODES[actionId], false]
    }
  }

  function edit(index: number) {
    const keyInfo = layoutInfo.keys[index]
    const clickedGroup = groupParent.children.item(index) as SVGGElement
    const component = new ActionSelector({
      target: document.body,
      props: {currentAction: get(layout)[activeLayer][keyInfo.id]},
    })
    const dialog = document.querySelector("dialog > div") as HTMLDivElement
    const backdrop = document.querySelector("dialog") as HTMLDialogElement
    const dialogRect = dialog.getBoundingClientRect()
    const groupRect = clickedGroup.getBoundingClientRect()

    const scale = 0.5
    const dialogScale = `${1 - scale * (1 - groupRect.width / dialogRect.width)} ${
      1 - scale * (1 - groupRect.height / dialogRect.height)
    }`
    const dialogTranslate = `${scale * (groupRect.x - dialogRect.x)}px ${
      scale * (groupRect.y - dialogRect.y)
    }px`

    const duration = 150
    const options = {duration, easing: "ease"}
    const dialogAnimation = dialog.animate(
      [
        {scale: dialogScale, translate: dialogTranslate},
        {translate: "0 0", scale: "1"},
      ],
      options,
    )
    const backdropAnimation = backdrop.animate([{opacity: 0}, {opacity: 1}], options)

    async function closed() {
      dialogAnimation.reverse()
      backdropAnimation.reverse()

      await dialogAnimation.finished

      component.$destroy()
    }

    component.$on("close", closed)
    component.$on("select", ({detail}) => {
      changes.update(changes => {
        changes.push({layout: {[activeLayer]: {[keyInfo.id]: detail}}})
        return changes
      })
      closed()
    })
  }

  let focusKey: CompiledLayoutKey
  let groupParent: SVGElement
</script>

<svelte:window on:keydown={navigate} />

<p>{layoutInfo.name}</p>
<svg viewBox="0 0 {layoutInfo.size[0] * scale} {layoutInfo.size[1] * scale}" bind:this={groupParent}>
  {#each layoutInfo.keys as key, i}
    {@const posX = key.pos[0] * scale}
    {@const posY = key.pos[1] * scale}
    {@const sizeX = key.size[0] * scale}
    {@const sizeY = key.size[1] * scale}
    {@const middleX = sizeX / 2}
    {@const middleY = sizeY / 2}
    <g
      class="key-group"
      on:click={() => edit(i)}
      on:keypress={({key}) => {
        if (key === "Enter") {
          edit(i)
        }
      }}
      on:focusin={() => (focusKey = key)}
      role="button"
      tabindex={i + 1}
    >
      <rect
        x={posX + margin}
        y={posY + margin}
        rx={margin}
        width={sizeX - margin * 2}
        height={sizeY - margin * 2}
        stroke="currentcolor"
        stroke-width={strokeWidth}
      />
      {#each [1, 2, 0] as layer, i}
        {@const [action, changed] = getActions(layer, key.id, $layout, $changes)}
        {@const isActive = layer === activeLayer}
        {@const direction = [
          (middleX - margin * 3) / (i % 2 === 0 ? -1 : 1),
          (middleY - margin * 3) / (i < 2 ? -1 : 1),
        ]}
        {@const layerFontSize = action?.icon ? iconFontSize : fontSize}
        <g
          style="transform: {isActive
            ? `translate3d(0, 0, 0) scale(1)`
            : `translate3d(${direction[0]}px, ${direction[1]}px, 0) scale(${inactiveScale})`}"
        >
          <text
            fill={changed ? "var(--md-sys-color-primary)" : "currentcolor"}
            text-anchor="middle"
            alignment-baseline="central"
            x={posX + middleX + (changed ? fontSize / 3 : 0)}
            y={posY + middleY}
            font-size={layerFontSize}
            font-family={action?.icon ? "Material Symbols Rounded" : undefined}
            opacity={isActive ? 1 : inactiveOpacity}
          >
            {action?.icon || action?.id || action?.code || `{${key.id}}`}
            {#if changed}
              <tspan font-weight="bold">•</tspan>
            {/if}
          </text>
        </g>
      {/each}
    </g>
  {/each}
</svg>

<style lang="scss">
  $focus-transition: 10ms;
  $transition: 200ms;

  svg {
    overflow: visible;
    width: calc(min(100%, 35cm));
    max-height: calc(100% - 170px);
  }

  text {
    transition:
      fill #{$focus-transition} ease,
      opacity #{$transition} ease;
  }

  rect {
    fill: var(--md-sys-color-background);
    transition:
      fill #{$focus-transition} ease,
      stroke #{$focus-transition} ease,
      fill-opacity #{$focus-transition} ease;
  }

  g {
    transform-origin: center;
    transform-box: fill-box;
    transition:
      fill #{$focus-transition} ease,
      opacity #{$transition} ease,
      transform #{$transition} ease;
  }

  .key-group:hover {
    cursor: default;
    opacity: 0.6;
    transition: opacity #{$transition} ease;
  }

  .key-group:focus-within {
    color: var(--md-sys-color-primary);
    outline: none;

    > rect {
      outline: none;
      fill: currentcolor;
      fill-opacity: 0.2;
    }
  }
</style>
