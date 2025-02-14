<script lang="ts">
  import Dialog from "$lib/dialogs/Dialog.svelte";
  import type { Chord } from "$lib/serial/chord";
  import ChordActionEdit from "../../routes/(app)/config/chords/ChordActionEdit.svelte";

  let {
    title,
    message,
    abortTitle,
    confirmTitle,
    chord,
    onabort,
    onconfirm,
  }: {
    title: string;
    message?: string;
    abortTitle: string;
    confirmTitle: string;
    chord: Chord & { deleted: boolean };
    onabort: () => void;
    onconfirm: () => void;
  } = $props();
</script>

<Dialog>
  <h1>{@html title}</h1>
  {#if message}
    <p>{@html message}</p>
  {/if}
  <p>
    <ChordActionEdit
      chord={{
        ...chord,
        isApplied: false,
        phraseChanged: false,
        actionsChanged: false,
        sortBy: "",
        id: chord.actions,
      }}
      interactive={false}
      onsubmit={() => {}}
    />
  </p>
  <div class="buttons">
    <button onclick={onabort}>{abortTitle}</button>
    <button class="primary" onclick={onconfirm}>{confirmTitle}</button>
  </div>
</Dialog>

<style lang="scss">
  h1 {
    font-size: 2em;
    text-align: center;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
</style>
