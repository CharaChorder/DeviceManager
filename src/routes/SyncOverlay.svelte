<script lang="ts">
  import {syncProgress, syncStatus} from "$lib/serial/connection"
  import LL from "../i18n/i18n-svelte"

  $: if (dialog) toggleDialog($syncStatus)

  async function toggleDialog(status: "uploading" | "downloading" | string) {
    // debounce
    await new Promise(resolve => setTimeout(resolve, 150))
    if ($syncStatus !== status) return

    if (!dialog.open && ($syncStatus === "uploading" || $syncStatus === "downloading")) {
      message = $syncStatus
      dialog.showModal()
      dialog.animate([{opacity: 0}, {opacity: 1}], {duration: 250, easing: "ease"})
    } else if (dialog.open) {
      const animation = dialog.animate([{opacity: 1}, {opacity: 0}], {duration: 250, easing: "ease"})
      animation.addEventListener("finish", () => {
        dialog.close()
      })
    }
  }

  let message: "downloading" | "uploading"
  let dialog: HTMLDialogElement
</script>

<dialog bind:this={dialog}>
  {#if message === "downloading"}
    <h2>{$LL.sync.TITLE_READ()}</h2>
  {:else}
    <h2>{$LL.sync.TITLE_WRITE()}</h2>
    <p>{$LL.sync.DISCLAIMER_WRITE()}</p>
  {/if}
  <progress max={$syncProgress?.max ?? 1} value={$syncProgress?.current ?? 1}></progress>
</dialog>

<style lang="scss">
  dialog::backdrop {
    background: rgba(0 0 0 / 70%);
  }

  progress {
    overflow: hidden;
    width: 100%;
    height: 16px;
    border-radius: 8px;
  }

  progress::-webkit-progress-bar {
    background: var(--md-sys-color-background);
  }

  progress::-webkit-progress-value {
    background: var(--md-sys-color-primary);
  }

  dialog {
    max-width: 14cm;
    padding: 2cm;

    color: white;

    background: none;
    border: none;
    outline: none;
  }
</style>
