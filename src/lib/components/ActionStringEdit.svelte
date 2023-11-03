<script lang="ts">
  import {KEYMAP_CODES, KEYMAP_IDS, specialKeycodes} from "$lib/serial/keymap-codes"
  import {tick} from "svelte"
  import ActionSelector from "$lib/components/layout/ActionSelector.svelte"
  import {changes, ChangeType} from "$lib/undo-redo"

  export let actions: number[]

  function keypress(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      selectAction()
    } else if (event.key === "ArrowLeft") {
      moveCursor(cursorPosition - 1)
    } else if (event.key === "ArrowRight") {
      moveCursor(cursorPosition + 1)
    } else if (event.key === "Backspace") {
      deleteAction(cursorPosition - 1)
      moveCursor(cursorPosition - 1)
    } else if (event.key === "Delete") {
      deleteAction(cursorPosition)
    } else if (KEYMAP_IDS.has(event.key)) {
      insertAction(cursorPosition, KEYMAP_IDS.get(event.key)!.code)
      tick().then(() => moveCursor(cursorPosition + 1))
    } else if (specialKeycodes.has(event.key)) {
      insertAction(cursorPosition, specialKeycodes.get(event.key)!)
      tick().then(() => moveCursor(cursorPosition + 1))
    }
  }

  function moveCursor(to: number) {
    cursorPosition = Math.max(0, Math.min(to, actions.length))
    const item = box.children.item(cursorPosition) as HTMLElement
    cursorOffset = item.offsetLeft + item.offsetWidth
  }

  function deleteAction(at: number, count = 1) {
    actions = actions.toSpliced(at, count)
  }

  function insertAction(at: number, action: number) {
    actions = actions.toSpliced(at, 0, action)
  }

  function clickCursor(event: unknown) {
    const distance = (event as {layerX: number}).layerX

    let i = 0
    for (const child of box.children) {
      const {offsetLeft, offsetWidth} = child as HTMLElement
      if (distance < offsetLeft + offsetWidth / 2) {
        moveCursor(i - 1)
        return
      }
      i++
    }
    moveCursor(i - 1)
  }

  function selectAction() {
    const component = new ActionSelector({target: document.body})
    const dialog = document.querySelector("dialog > div") as HTMLDivElement
    const backdrop = document.querySelector("dialog") as HTMLDialogElement
    const dialogRect = dialog.getBoundingClientRect()
    const groupRect = button.getBoundingClientRect()

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
      await tick()
      box.focus()
    }

    component.$on("close", closed)
    component.$on("select", ({detail}) => {
      insertAction(cursorPosition, detail)
      tick().then(() => moveCursor(cursorPosition + 1))
      closed()
    })
  }

  let button: HTMLButtonElement
  let box: HTMLDivElement
  let cursorPosition = 0
  let cursorOffset = 0
</script>

<div on:keydown={keypress} on:mousedown={clickCursor} role="textbox" tabindex="0" bind:this={box}>
  <div class="cursor" style:translate="{cursorOffset}px 0">
    <button class="icon" bind:this={button} on:click={selectAction}>add</button>
  </div>
  {#each actions as actionId}
    {@const {icon, id, code} = KEYMAP_CODES[actionId] ?? {code: actionId}}
    {#if !icon && id?.length === 1}
      <span>{id}</span>
    {:else}
      <kbd class:icon={!!icon}>{icon ?? id ?? `0x${code.toString(16)}`}</kbd>
    {/if}
  {/each}
</div>

<style lang="scss">
  .cursor {
    display: none;
  }

  :not(.cursor) + kbd {
    margin-inline-start: 2px;
  }

  kbd + * {
    margin-inline-start: 2px;
  }

  [role="textbox"] {
    cursor: text;

    position: relative;

    display: flex;
    align-items: center;

    height: 1em;

    &:focus-within {
      outline: none;

      .cursor {
        position: absolute;
        transform: translateX(-50%);
        translate: 0 0;

        display: block;

        width: 2px;
        height: 100%;

        background: var(--md-sys-color-on-secondary-container);

        transition: translate 50ms ease;

        button {
          position: absolute;
          top: -24px;
          left: 0;

          height: 24px;
          padding: 0;

          color: var(--md-sys-color-on-secondary-container);

          background: var(--md-sys-color-secondary-container);
          border: 2px solid currentcolor;
          border-radius: 12px 12px 12px 0;
        }
      }
    }
  }
</style>
