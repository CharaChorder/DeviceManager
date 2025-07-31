<script lang="ts">
  import { onMount, type Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    modal.showModal();
  });

  let modal: HTMLDialogElement;
</script>

<dialog bind:this={modal}>
  {@render children()}
</dialog>

<style lang="scss">
  dialog {
    box-shadow: 0 0 48px rgba(0 0 0 / 60%);
    border: none;
    border-radius: 38px;

    background: var(--md-sys-color-background);
    min-width: 300px;
    max-width: 512px;

    color: var(--md-sys-color-on-background);
  }

  dialog::backdrop {
    opacity: 0.5;
    background: black;
  }
</style>
