<script>
  import {getSharableUrl, stringifyCompressed} from "$lib/serial/serialization"
  import {chords} from "$lib/serial/connection"

  async function downloadBackup() {
    const downloadUrl = URL.createObjectURL(await stringifyCompressed($chords))
    const element = document.createElement("a")
    element.setAttribute("download", "chords.chl")
    element.href = downloadUrl
    element.setAttribute("target", "_blank")
    element.click()
    URL.revokeObjectURL(downloadUrl)
  }

  async function createShareUrl() {
    console.log(await getSharableUrl("chords", $chords))
  }
</script>

<h1>Backup & Restore</h1>

<button on:click={downloadBackup}><span class="icon">save</span> Backup</button>
<button><span class="icon">settings_backup_restore</span> Restore</button>
