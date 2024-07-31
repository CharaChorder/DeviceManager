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
    min-width: 300px;
    max-width: 512px;

    color: var(--md-sys-color-on-background);

    background: var(--md-sys-color-background);
    border: none;
    border-radius: 38px;
    box-shadow: 0 0 48px rgba(0 0 0 / 60%);
  }

  dialog::backdrop {
    opacity: 0.5;
    background: black;
  }
</style>
