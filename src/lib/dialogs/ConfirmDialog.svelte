<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Dialog from "$lib/dialogs/Dialog.svelte";
  import ActionString from "$lib/components/ActionString.svelte";

  export let title: string;
  export let message: string | undefined;
  export let abortTitle: string;
  export let confirmTitle: string;

  export let actions: number[] = [];

  const dispatch = createEventDispatcher();
</script>

<Dialog>
  <h1>{@html title}</h1>
  {#if message}
    <p>{@html message}</p>
  {/if}
  <p><ActionString {actions} /></p>
  <div class="buttons">
    <button on:click={() => dispatch("abort")}>{abortTitle}</button>
    <button class="primary" on:click={() => dispatch("confirm")}
      >{confirmTitle}</button
    >
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
