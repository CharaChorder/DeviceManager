<script lang="ts">
  import {preference} from "$lib/preferences"
  import LL from "../i18n/i18n-svelte"
  import {
    createChordBackup,
    createLayoutBackup,
    createSettingsBackup,
    downloadBackup,
    downloadFile,
    restoreBackup,
  } from "../../../../packages/backups/lib/backup"
</script>

<section>
  <h2><label><input type="checkbox" use:preference={"backup"} />{$LL.backup.TITLE()}</label></h2>
  <p class="disclaimer">
    <i>{$LL.backup.DISCLAIMER()}</i>
  </p>
  <fieldset>
    <legend>{$LL.backup.INDIVIDUAL()}</legend>
    <button on:click={() => downloadFile(createChordBackup())}>
      <span class="icon">piano</span>
      {$LL.configure.chords.TITLE()}
    </button>
    <button on:click={() => downloadFile(createLayoutBackup())}>
      <span class="icon">keyboard</span>
      {$LL.configure.layout.TITLE()}
    </button>
    <button on:click={() => downloadFile(createSettingsBackup())}>
      <span class="icon">settings</span>
      {$LL.configure.settings.TITLE()}
    </button>
  </fieldset>
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

  fieldset {
    display: flex;
    margin-block: 16px;
    border: 1px solid currentcolor;
    border-radius: 16px;
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
