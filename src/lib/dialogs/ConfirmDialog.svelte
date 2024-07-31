<script lang="ts">
  import Dialog from "$lib/dialogs/Dialog.svelte";
  import ActionString from "$lib/components/ActionString.svelte";

  let {
    title,
    message,
    abortTitle,
    confirmTitle,
    actions = [],
    onabort,
    onconfirm,
  }: {
    title: string;
    message?: string;
    abortTitle: string;
    confirmTitle: string;
    actions: number[];
    onabort: () => void;
    onconfirm: () => void;
  } = $props();
</script>

<Dialog>
  <h1>{@html title}</h1>
  {#if message}
    <p>{@html message}</p>
  {/if}
  <p><ActionString {actions} /></p>
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
