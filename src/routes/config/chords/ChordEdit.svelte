<script lang="ts">
  import {changes, ChangeType} from "$lib/undo-redo.js"
  import type {ChordInfo} from "$lib/undo-redo.js"
  import ChordPhraseEdit from "./ChordPhraseEdit.svelte"
  import ChordActionEdit from "./ChordActionEdit.svelte"
  import type {Chord} from "$lib/serial/chord"
  import {slide} from "svelte/transition"

  export let chord: ChordInfo

  function remove() {
    changes.update(changes => {
      changes.push({type: ChangeType.Chord, id: chord.id, actions: chord.actions, phrase: []})
      return changes
    })
  }

  function isSameChord(a: Chord, b: Chord) {
    return a.actions.length === b.actions.length && a.actions.every((it, i) => it === b.actions[i])
  }

  function restore() {
    changes.update(changes => changes.filter(it => !(it.type === ChangeType.Chord && isSameChord(it, chord))))
  }
</script>

<th>
  <ChordActionEdit {chord} />
</th>
<td>
  <ChordPhraseEdit {chord} />
</td>
<td class="table-buttons">
  {#if chord.phrase.length !== 0}
    <button transition:slide class="icon compact" on:click={remove}>delete</button>
  {:else if chord.phraseChanged}
    <button transition:slide class="icon compact" on:click={restore}>restore_from_trash</button>
  {/if}
  <button class="icon compact" class:disabled={chord.isApplied} on:click={restore}>undo</button>
  <div class="separator" />
  <button class="icon compact">share</button>
</td>

<style lang="scss">
  .separator {
    display: inline-flex;

    width: 1px;
    height: 24px;

    opacity: 0.2;
    background: currentcolor;
  }

  td {
    position: relative;
  }

  .table-buttons {
    opacity: 0;
    transition: opacity 75ms ease;
  }

  :global(tr):focus-within > .table-buttons,
  :global(tr):hover > .table-buttons {
    opacity: 1;
  }
</style>
