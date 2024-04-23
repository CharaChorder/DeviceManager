<script lang="ts">
  import { changes, ChangeType, chords } from "$lib/undo-redo.js";
  import type { ChordInfo } from "$lib/undo-redo.js";
  import ChordPhraseEdit from "./ChordPhraseEdit.svelte";
  import ChordActionEdit from "./ChordActionEdit.svelte";
  import type { Chord } from "$lib/serial/chord";
  import { slide } from "svelte/transition";
  import { charaFileToUriComponent } from "$lib/share/share-url";
  import SharePopup from "../SharePopup.svelte";
  import tippy from "tippy.js";
  import { createEventDispatcher } from "svelte";

  export let chord: ChordInfo;

  const dispatch = createEventDispatcher<{ duplicate: void }>();

  function remove() {
    changes.update((changes) => {
      changes.push({
        type: ChangeType.Chord,
        id: chord.id,
        actions: chord.actions,
        phrase: chord.phrase,
        deleted: true,
      });
      return changes;
    });
  }

  function isSameChord(a: Chord, b: Chord) {
    return (
      a.actions.length === b.actions.length &&
      a.actions.every((it, i) => it === b.actions[i])
    );
  }

  function restore() {
    changes.update((changes) =>
      changes.filter(
        (it) => !(it.type === ChangeType.Chord && isSameChord(it, chord)),
      ),
    );
  }

  function duplicate() {
    const id = [...chord.id];
    id.splice(id.indexOf(0), 1);
    id.push(0);
    while ($chords.some((it) => JSON.stringify(it.id) === JSON.stringify(id))) {
      id[id.length - 1]++;
    }

    changes.update((changes) => {
      changes.push({
        type: ChangeType.Chord,
        id,
        actions: [...chord.actions],
        phrase: [...chord.phrase],
      });
      return changes;
    });

    dispatch("duplicate");
  }

  async function share(event: Event) {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "import",
      await charaFileToUriComponent({
        charaVersion: 1,
        type: "chords",
        chords: [[chord.actions, chord.phrase]],
      }),
    );
    await navigator.clipboard.writeText(url.toString());
    let shareComponent: SharePopup;
    tippy(event.target as HTMLElement, {
      onCreate(instance) {
        const target = instance.popper.querySelector(".tippy-content")!;
        shareComponent = new SharePopup({ target });
      },
      onHidden(instance) {
        instance.destroy();
      },
      onDestroy(_instance) {
        shareComponent.$destroy();
      },
    }).show();
  }
</script>

<th>
  <ChordActionEdit {chord} />
</th>
<td>
  <ChordPhraseEdit {chord} />
</td>
<td class="table-buttons">
  {#if !chord.deleted}
    <button transition:slide class="icon compact" on:click={remove}
      >delete</button
    >
  {:else}
    <button transition:slide class="icon compact" on:click={restore}
      >restore_from_trash</button
    >
  {/if}
  <button disabled={chord.deleted} class="icon compact" on:click={duplicate}
    >content_copy</button
  >
  <button
    class="icon compact"
    class:disabled={chord.isApplied}
    on:click={restore}>undo</button
  >
  <div class="separator" />
  <button class="icon compact" on:click={share}>share</button>
</td>

<style lang="scss">
  .separator {
    display: inline-flex;

    width: 1px;
    height: 24px;

    opacity: 0.2;
    background: currentcolor;
  }

  button {
    transition: opacity 75ms ease;
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
