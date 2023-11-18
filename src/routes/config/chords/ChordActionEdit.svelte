<script lang="ts">
  import {KEYMAP_IDS} from "$lib/serial/keymap-codes"
  import type {ChordInfo} from "$lib/undo-redo"
  import {changes, ChangeType} from "$lib/undo-redo"
  import {createEventDispatcher} from "svelte"
  import LL from "../../../i18n/i18n-svelte"
  import ActionString from "$lib/components/ActionString.svelte"

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
    pressedKeys.add(KEYMAP_IDS.get(event.key)!.code)
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
</script>

<button
  class:deleted={chord && chord.phrase.length === 0}
  class:edited={chord && chord.actionsChanged}
  class:invalid={chord && chord.actions.toSorted(compare).some((it, i) => chord?.actions[i] !== it)}
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

  button {
    position: relative;

    display: inline-flex;
    gap: 4px;

    height: 32px;
    margin-inline: 4px;

    &:focus-within {
      outline: none;
    }
  }

  button::after {
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
