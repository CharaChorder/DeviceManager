<script lang="ts">
  import type {ChordInfo} from "$lib/undo-redo"
  import {changes, ChangeType} from "$lib/undo-redo"
  import {createEventDispatcher} from "svelte"
  import LL from "../../../i18n/i18n-svelte"
  import ActionString from "$lib/components/ActionString.svelte"
  import {selectAction} from "./action-selector"
  import {serialPort} from "$lib/serial/connection"
  import {get} from "svelte/store"
  import {inputToAction} from "./input-converter"

  export let chord: ChordInfo | undefined = undefined

  const dispatch = createEventDispatcher()

  let pressedKeys = new Set<number>()
  let editing = false

  function compare(a: number, b: number) {
    return a - b
  }

  function edit() {
    pressedKeys = new Set()
    editing = true
  }

  function keydown(event: KeyboardEvent) {
    if (!editing) return
    event.preventDefault()
    pressedKeys.add(inputToAction(event, get(serialPort)?.device === "X")!)
    pressedKeys = pressedKeys
  }

  function keyup() {
    if (!editing) return
    editing = false
    if (pressedKeys.size < 2) return
    if (!chord) return dispatch("submit", [...pressedKeys].sort(compare))
    changes.update(changes => {
      changes.push({
        type: ChangeType.Chord,
        id: chord!.id,
        actions: [...pressedKeys].sort(compare),
        phrase: chord!.phrase,
      })
      return changes
    })
  }

  function addSpecial(event: MouseEvent) {
    selectAction(event, action => {
      changes.update(changes => {
        changes.push({
          type: ChangeType.Chord,
          id: chord!.id,
          actions: [...chord!.actions, action].sort(compare),
          phrase: chord!.phrase,
        })
        return changes
      })
    })
  }
</script>

<button
  class:deleted={chord && chord.deleted}
  class:edited={chord && chord.actionsChanged}
  class:invalid={chord && chord.actions.toSorted(compare).some((it, i) => chord?.actions[i] !== it)}
  class="chord"
  on:click={edit}
  on:keydown={keydown}
  on:keyup={keyup}
>
  {#if editing && pressedKeys.size === 0}
    <span>{$LL.configure.chords.HOLD_KEYS()}</span>
  {:else if !editing && !chord}
    <span>{$LL.configure.chords.NEW_CHORD()}</span>
  {/if}
  <ActionString display="keys" actions={editing ? [...pressedKeys].sort(compare) : chord?.actions ?? []} />
  <button class="icon add" on:click|stopPropagation={addSpecial}>add_circle</button>
  <sup>•</sup>
</button>

<style lang="scss">
  span {
    opacity: 0.5;
  }

  sup {
    translate: 0 -60%;
    opacity: 0;
    transition: opacity 250ms ease;
  }

  .add {
    font-size: 18px;
    margin-inline-start: 4px;
    height: 20px;
    opacity: 0;
    --icon-fill: 1;
  }

  .chord:hover .add {
    opacity: 1;
  }

  .chord {
    position: relative;

    display: inline-flex;
    gap: 4px;

    height: 32px;
    margin-inline: 4px;

    &:focus-within {
      outline: none;
    }
  }

  .chord::after {
    content: "";

    position: absolute;
    top: 50%;
    transform-origin: center left;
    translate: -6px 0;
    scale: 0 1;

    width: calc(100% - 32px);
    height: 1px;

    background: currentcolor;

    transition:
      scale 250ms ease,
      color 250ms ease;
  }

  .edited {
    color: var(--md-sys-color-primary);

    & > sup {
      opacity: 1;
    }
  }

  .invalid {
    color: var(--md-sys-color-error);
  }

  .deleted {
    color: var(--md-sys-color-error);

    &::after {
      scale: 1;
    }
  }
</style>
