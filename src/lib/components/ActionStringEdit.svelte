<script lang="ts">
  import {KEYMAP_CODES, KEYMAP_IDS, specialKeycodes} from "$lib/serial/keymap-codes"
  import {onDestroy, onMount} from "svelte"
  import type ActionSelector from "$lib/components/layout/ActionSelector.svelte"

  export let actions: number[]

  onMount(() => {
    document.addEventListener("selectionchange", select)
  })

  onDestroy(() => {
    document.removeEventListener("selectionchange", select)
  })

  function input(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
      case "Escape":
      case "Tab": {
        return
      }
      case "Backspace": {
        caretPosition--
        if (caretPosition >= 0) actions = actions.toSpliced(caretPosition, 1)
        else caretPosition = 0
        break
      }
      case "Delete": {
        if (caretPosition < actions.length) actions = actions.toSpliced(caretPosition, 1)
        break
      }
      default: {
        if (specialKeycodes.has(event.key)) {
          actions = actions.toSpliced(caretPosition, 0, 32)
        } else if (KEYMAP_IDS.has(event.key)) {
          actions = actions.toSpliced(caretPosition, 0, KEYMAP_IDS.get(event.key)!.code)
        } else {
          break
        }

        break
      }
    }
    event.preventDefault()
    console.log(event.key)
  }

  function select() {
    const selection = document.getSelection()
    if (!selection || !selection.containsNode(field, true)) return

    let node = selection.anchorNode?.parentNode
    let i = 0
    while (node) {
      i++
      node = node.previousSibling
    }

    const range = selection.getRangeAt(0)
    const clonedRange = range.cloneRange()
    clonedRange.selectNodeContents(field)
    clonedRange.setEnd(range.endContainer, range.endOffset)

    caretPosition = (i - 1) / 2 + clonedRange.endOffset
    console.log(caretPosition)
  }

  let editDialog: ActionSelector
  let caretPosition: number
  let field: HTMLSpanElement
</script>

<svelte:window on:selectionchange={select} />

<span
  bind:this={field}
  contenteditable
  on:keydown={input}
  spellcheck="false"
  on:select|preventDefault={select}
  role="textbox"
  tabindex="0"
>
  {#each actions as char}
    {@const action = KEYMAP_CODES[char]}
    {#if action?.id && /^\w$/.test(action.id)}
      <span data-action={char}>{KEYMAP_CODES[char].id}</span>
    {:else if action}
      <kbd data-action={char} title={action.title} class:icon={!!action.icon}>{action.icon || action.id}</kbd>
    {:else}
      <kbd data-action={char}>{action}</kbd>
    {/if}
  {/each}
  <!-- <kbd class="icon" style="background: red">abc</kbd> -->
</span>

<style lang="scss">
  kbd {
    min-width: 24px;
    height: 24px;
    margin-inline-end: 4px;
  }

  :not(kbd) + kbd {
    margin-inline-start: 4px;
  }

  span[contenteditable]:focus-within {
    outline-offset: 4px;
  }
</style>
