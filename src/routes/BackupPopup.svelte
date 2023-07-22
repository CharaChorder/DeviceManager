<script lang="ts">
  import {getSharableUrl, parseCompressed, stringifyCompressed} from "$lib/serial/serialization"
  import {chords, layout} from "$lib/serial/connection"
  import {preference} from "$lib/preferences"

  async function downloadBackup() {
    const downloadUrl = URL.createObjectURL(
      await stringifyCompressed({
        isCharaBackup: "v1.0",
        chords: $chords,
        layout: $layout,
      }),
    )
    const element = document.createElement("a")
    element.setAttribute("download", "chords.chb")
    element.href = downloadUrl
    element.setAttribute("target", "_blank")
    element.click()
    URL.revokeObjectURL(downloadUrl)
  }

  async function restoreBackup(event: InputEvent) {
    const input = (event.target as HTMLInputElement).files![0]
    if (!input) return
    const backup = await parseCompressed(input)
    if (backup.isCharaBackup !== "v1.0") throw new Error("Invalid Backup")
    if (backup.chords) {
      $chords = backup.chords
    }
    if (backup.layout) {
      $layout = backup.layout
    }
  }

  async function createShareUrl() {
    console.log(await getSharableUrl("chords", $chords))
  }
</script>

<section>
  <h2>Backup & Restore</h2>
  <label><input type="checkbox" use:preference={"backup"} />Local backups</label>
  <p class="disclaimer">
    <i>Backups remain on your computer and are never shared or uploaded to our servers.</i>
  </p>
  <div class="save">
    <button class="primary" on:click={downloadBackup}><span class="icon">save</span> Download Backup</button>
    <label class="button"
      ><input on:input={restoreBackup} type="file" /><span class="icon">settings_backup_restore</span> Restore</label
    >
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  .disclaimer {
    max-width: 16cm;
    font-size: 12px;
    opacity: 0.7;
  }

  input[type="file"] {
    display: none;
  }

  .save {
    display: flex;
    gap: 4px;
  }

  .button,
  button {
    cursor: pointer;

    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;

    height: 48px;
    padding-block: 8px;
    padding-inline: 16px;

    font-family: "Noto Sans Mono", monospace;
    font-weight: 600;
    color: var(--md-sys-color-on-background);

    background: transparent;
    border: none;
    border-radius: 32px;

    transition: all 250ms ease;

    &.primary {
      color: var(--md-sys-color-on-primary);
      background: var(--md-sys-color-primary);
    }
  }
</style>
