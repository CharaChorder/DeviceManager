<script lang="ts">
  import LL from "../i18n/i18n-svelte"
  import {changes} from "$lib/serial/connection"
  import type {Change} from "$lib/serial/connection"
  import {fly} from "svelte/transition"
  import {action} from "$lib/title"

  function undo() {
    redoQueue = [$changes.pop()!, ...redoQueue]
    changes.update(it => it)
  }

  function redo() {
    const [change, ...queue] = redoQueue
    changes.update(it => {
      it.push(change)
      return it
    })
    redoQueue = queue
  }
  let redoQueue: Change[] = []

  function apply() {
    // TODO
  }
</script>

<button
  use:action={{title: $LL.saveActions.UNDO(), shortcut: "ctrl+z"}}
  class="icon"
  disabled={$changes.length === 0}
  on:click={undo}>undo</button
>
<button
  use:action={{title: $LL.saveActions.REDO(), shortcut: "ctrl+y"}}
  class="icon"
  disabled={redoQueue.length === 0}
  on:click={redo}>redo</button
>
<div class="separator" />
<button use:action={{title: $LL.saveActions.SAVE(), shortcut: "ctrl+shift+s"}} class="icon">save</button>
{#if $changes.length !== 0}
  <button class="click-me" transition:fly={{x: 8}} use:action={{shortcut: "ctrl+s"}}
    ><span class="icon">bolt</span>{$LL.saveActions.APPLY()}</button
  >
{/if}

<style lang="scss">
  .click-me {
    display: flex;
    align-items: center;
    justify-content: center;

    margin-inline: 8px;
    padding-block: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 8px;

    font-family: inherit;
    font-weight: bold;
    color: var(--md-sys-color-primary);

    border: 2px solid var(--md-sys-color-primary);
    border-radius: 18px;
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: var(--md-sys-color-outline-variant);
  }
</style>
