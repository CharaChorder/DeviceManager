<script lang="ts">
  import {serialPort} from "$lib/serial/connection"
  import {preference} from "$lib/preferences"
  import LL from "../i18n/i18n-svelte"
  import type {
    CharaBackupFile,
    CharaChordFile,
    CharaSettingsFile,
    CharaLayoutFile,
  } from "$lib/share/chara-file.js"
  import {changes, ChangeType, chords, layout, settings} from "$lib/undo-redo.js"
  import type {Change} from "$lib/undo-redo.js"

  async function downloadBackup() {
    const downloadUrl = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify({
            charaVersion: 1,
            type: "backup",
            history: [
              [
                {charaVersion: 1, type: "chords", chords: $chords.map(it => [it.actions, it.phrase])},
                {
                  charaVersion: 1,
                  type: "layout",
                  device: $serialPort?.device,
                  layout: $layout.map(it => it.map(it => it.action)) as [number[], number[], number[]],
                },
                {charaVersion: 1, type: "settings", settings: $settings.map(it => it.value)},
              ],
            ],
          } satisfies CharaBackupFile),
        ],
        {type: "application/json"},
      ),
    )
    const element = document.createElement("a")
    element.setAttribute("download", "backup.json")
    element.href = downloadUrl
    element.setAttribute("target", "_blank")
    element.click()
    URL.revokeObjectURL(downloadUrl)
  }

  async function restoreBackup(event: Event) {
    const input = (event.target as HTMLInputElement).files![0]
    if (!input) return
    const backup: CharaBackupFile = JSON.parse(await input.text())
    if (backup.charaVersion !== 1 || backup.type !== "backup") throw new Error("Invalid Backup")

    const recent = backup.history[0]
    if (recent[1].device !== $serialPort?.device) throw new Error("Backup is incompatible with this device")

    changes.update(changes => {
      changes.push(
        ...getChangesFromChordFile(recent[0]),
        ...getChangesFromLayoutFile(recent[1]),
        ...getChangesFromSettingsFile(recent[2]),
      )
      return changes
    })
  }

  function getChangesFromChordFile(file: CharaChordFile) {
    const changes: Change[] = []
    // TODO...
    return changes
  }

  function getChangesFromSettingsFile(file: CharaSettingsFile) {
    const changes: Change[] = []
    for (const [id, value] of file.settings.entries()) {
      if ($settings[id].value !== value) {
        changes.push({
          type: ChangeType.Setting,
          id,
          setting: value,
        })
      }
    }
    return changes
  }

  function getChangesFromLayoutFile(file: CharaLayoutFile) {
    const changes: Change[] = []
    for (const [layer, keys] of file.layout.entries()) {
      for (const [id, action] of keys.entries()) {
        if ($layout[layer][id].action !== action) {
          changes.push({
            type: ChangeType.Layout,
            layer,
            id,
            action,
          })
        }
      }
    }
    return changes
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
