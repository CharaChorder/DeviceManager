<script lang="ts">
  import {createEventDispatcher} from "svelte"
  import Dialog from "$lib/dialogs/Dialog.svelte"

  export let title: string
  export let message: string | undefined
  export let abortTitle: string
  export let confirmTitle: string

  const dispatch = createEventDispatcher()
</script>

<Dialog>
  <h1>{@html title}</h1>
  {#if message}
    <p>{@html message}</p>
  {/if}
  <div class="buttons">
    <button on:click={() => dispatch("abort")}>{abortTitle}</button>
    <button class="primary" on:click={() => dispatch("confirm")}>{confirmTitle}</button>
  </div>
</Dialog>

<style lang="scss">
  h1 {
    font-size: 2em;
    text-align: center;
  }

  dialog {
    min-width: 300px;
    max-width: 512px;

    color: var(--md-sys-color-on-background);

    background: var(--md-sys-color-background);
    border: none;
    border-radius: 38px;
    box-shadow: 0 0 48px rgba(0 0 0 / 60%);
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  dialog::backdrop {
    opacity: 0.5;
    background: black;
  }
</style>
