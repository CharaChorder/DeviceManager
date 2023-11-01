<script lang="ts">
  import {parseCompressed, stringifyCompressed} from "$lib/serial/serialization"
  import {deviceChords, deviceLayout} from "$lib/serial/connection"
  import {preference} from "$lib/preferences"
  import type {Chord} from "$lib/serial/chord"
  import type {CharaLayout} from "$lib/serialization/layout"
  import LL from "../i18n/i18n-svelte"

  interface Backup {
    isCharaBackup: string
    chords: Chord[]
    layout: CharaLayout
  }

  async function downloadBackup() {
    const downloadUrl = URL.createObjectURL(
      await stringifyCompressed({
        isCharaBackup: "v1.0",
        chords: $deviceChords,
        layout: $deviceLayout,
      }),
    )
    const element = document.createElement("a")
    element.setAttribute("download", "chords.chb")
    element.href = downloadUrl
    element.setAttribute("target", "_blank")
    element.click()
    URL.revokeObjectURL(downloadUrl)
  }

  async function restoreBackup(event: Event) {
    const input = (event.target as HTMLInputElement).files![0]
    if (!input) return
    const backup = await parseCompressed<Backup>(input)
    if (backup.isCharaBackup !== "v1.0") throw new Error("Invalid Backup")
    if (backup.chords) {
      $deviceChords = backup.chords
    }
    if (backup.layout) {
      $deviceLayout = backup.layout
    }
  }
</script>

<section>
  <h2><label><input type="checkbox" use:preference={"backup"} />{$LL.backup.TITLE()}</label></h2>
  <p class="disclaimer">
    <i>{$LL.backup.DISCLAIMER()}</i>
  </p>
  <div class="save">
    <button class="primary" on:click={downloadBackup}
      ><span class="icon">save</span>{$LL.backup.DOWNLOAD()}</button
    >
    <label class="button"
      ><input on:input={restoreBackup} type="file" /><span class="icon">settings_backup_restore</span
      >{$LL.backup.RESTORE()}</label
    >
  </div>
</section>

<style lang="scss">
  h2 {
    margin-block-end: 0;

    > label {
      gap: 10px;
      font-size: 24px;

      > input {
        font-size: 12px;
      }
    }
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    width: min-content;
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
</style>
