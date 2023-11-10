<script lang="ts">
  import type {Chord} from "$lib/serial/chord"
  import {KEYMAP_CODES, KEYMAP_IDS} from "$lib/serial/keymap-codes"

  export let chord: Chord

  let pressedKeys = new Set<number>()
  let editing = false

  function edit() {
    pressedKeys = new Set()
    editing = true
  }

  function keydown(event: KeyboardEvent) {
    // TODO...
    pressedKeys.add(KEYMAP_IDS.get(event.key)!.code)
    pressedKeys = pressedKeys
  }

  function keyup() {
    editing = false
    // TODO: apply
  }
</script>

<button class:deleted={chord.phrase.length === 0} on:click={edit} on:keydown={keydown} on:keyup={keyup}>
  {#if editing && pressedKeys.size === 0}
    <span>Press keys</span>
  {/if}
  {#each editing ? [...pressedKeys].sort() : chord.actions as actionId}
    {@const {icon, id, code} = KEYMAP_CODES[actionId] ?? {code: actionId}}
    <kbd class:icon={!!icon}>
      {icon ?? id ?? `0x${code.toString(16)}`}
    </kbd>
  {/each}
</button>

<style lang="scss">
  span {
    opacity: 0.5;
  }

  button {
    position: relative;
    display: inline-flex;
    gap: 4px;
    margin-inline: 4px;

    &:focus-within {
      outline: none;
    }
  }

  kbd {
    transition: color 250ms ease;
  }

  button::after {
    content: "";

    position: absolute;
    top: 50%;
    transform-origin: center left;
    scale: 0 1;

    width: calc(100% - 16px);
    height: 1px;

    background: currentcolor;

    transition:
      scale 250ms ease,
      color 250ms ease;
  }

  .deleted {
    color: var(--md-sys-color-error);

    &::after {
      scale: 1;
    }
  }
</style>
