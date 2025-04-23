<script lang="ts">
  import Action from "$lib/components/Action.svelte";
  import { popup } from "$lib/popup";
  import { deviceMeta, serialPort } from "$lib/serial/connection";
  import { setting } from "$lib/setting";
  import ResetPopup from "./ResetPopup.svelte";
  import LL from "$i18n/i18n-svelte";
  import {
    createChordBackup,
    createLayoutBackup,
    createSettingsBackup,
    downloadBackup,
    downloadFile,
    restoreBackup,
    restoreFromFile,
  } from "$lib/backup/backup";
  import { preference } from "$lib/preferences";
  import { action } from "$lib/title";
  import { fly } from "svelte/transition";
  import type { SettingsItemMeta } from "$lib/meta/types/meta";

  function titlecase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function settingValue(value: number, setting: SettingsItemMeta) {
    if (setting.inverse !== undefined) {
      return setting.inverse / value;
    }
    if (setting.scale !== undefined) {
      return value * setting.scale;
    }
    return value;
  }
</script>

<svelte:head>
  <title>Device Settings - CharaChorder Device Manager</title>
  <meta name="description" content="Change your device's settings" />
</svelte:head>

<section>
  <fieldset>
    <legend>{$LL.backup.TITLE()}</legend>
    <label
      ><input
        type="checkbox"
        use:preference={"backup"}
      />{$LL.backup.AUTO_BACKUP()}</label
    >
    <p class="disclaimer">
      {$LL.backup.DISCLAIMER()}
    </p>
    <div class="row" style="margin-top: auto">
      <button onclick={() => downloadFile(createChordBackup())}>
        <span class="icon">piano</span>
        {$LL.configure.chords.TITLE()}
      </button>
      <button onclick={() => downloadFile(createLayoutBackup())}>
        <span class="icon">keyboard</span>
        {$LL.configure.layout.TITLE()}
      </button>
      <button onclick={() => downloadFile(createSettingsBackup())}>
        <span class="icon">settings</span>
        Settings
      </button>
    </div>
    <div class="row">
      <button class="primary" onclick={downloadBackup}
        ><span class="icon">download</span>{$LL.backup.DOWNLOAD()}</button
      >
      <label class="button"
        ><input oninput={restoreBackup} type="file" /><span class="icon"
          >settings_backup_restore</span
        >{$LL.backup.RESTORE()}</label
      >
    </div>
  </fieldset>

  <fieldset>
    <legend>Device</legend>
    <label
      >{$LL.deviceManager.AUTO_CONNECT()}<input
        type="checkbox"
        use:preference={"autoConnect"}
      /></label
    >
    {#if $serialPort}
      {#if $deviceMeta?.factoryDefaults?.settings}
        <button
          use:action={{ title: "Reset Settings" }}
          transition:fly={{ x: -8 }}
          onclick={() => restoreFromFile($deviceMeta.factoryDefaults!.settings)}
          ><span class="icon">reset_settings</span>Reset Settings</button
        >
      {/if}
      <button class="outline" use:popup={ResetPopup}>Recovery...</button>
    {/if}
  </fieldset>
  {#if $deviceMeta}
    {#each $deviceMeta.settings as category}
      <fieldset>
        <legend>
          {#if category.items[0]?.name === "enable"}
            <label
              ><input
                type="checkbox"
                use:setting={{ id: category.items[0].id }}
              />{titlecase(category.name)}</label
            >
          {:else}
            {titlecase(category.name)}
          {/if}
        </legend>
        {#if category.description}
          <p>{category.description}</p>
        {/if}
        {#each category.items as item}
          {#if item.name !== "enable"}
            {#if item.unit === "H"}
              <label
                ><input type="color" use:setting={{ id: item.id }} /> Color</label
              >
            {:else if item.unit !== "S" && item.unit !== "B"}
              <label
                >{#if item.enum}
                  <select use:setting={{ id: item.id }}>
                    {#each item.enum as name, value}
                      <option {value}>{titlecase(name)}</option>
                    {/each}
                  </select>
                {:else if item.range[0] === 0 && item.range[1] === 1}
                  <input type="checkbox" use:setting={{ id: item.id }} />
                {:else}
                  <span class="unit"
                    ><input
                      type="number"
                      min={settingValue(item.range[0], item)}
                      max={settingValue(item.range[1], item)}
                      step={item.inverse !== undefined ||
                      item.scale !== undefined ||
                      item.step === undefined
                        ? undefined
                        : settingValue(item.step, item)}
                      use:setting={{
                        id: item.id,
                        inverse: item.inverse,
                        scale: item.scale,
                      }}
                    />{item.unit}</span
                  >
                {/if}
                {#if item.description}
                  <span
                    >{titlecase(item.name)}
                    <p>{item.description}</p></span
                  >
                {:else}
                  {titlecase(item.name)}
                {/if}
              </label>
            {/if}
          {/if}
        {/each}
      </fieldset>
    {/each}
  {/if}
</section>

<style lang="scss">
  section {
    overflow-y: auto;
    display: flex;
    flex-flow: row wrap;
    gap: 16px;
    justify-content: center;

    margin-block: auto;
    padding-block-end: 48px;
  }

  button.outline {
    border: 1px solid currentcolor;
    border-radius: 8px;
    height: 2em;
    margin-block: 2em;
    margin-inline: auto;
  }

  legend,
  legend > label {
    font-size: 24px;
    font-weight: bold;
    position: relative;
    padding: 0 16px;
  }

  legend:has(label) {
    padding: 0;
  }

  legend:not(:has(label)) {
    opacity: 0.8;
  }

  input[type="checkbox"] {
    font-size: 12px !important;
  }

  fieldset {
    display: flex;
    flex-direction: column;

    max-width: 400px;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 24px;

    /*&:has(> legend input:not(:checked)) > :not(legend) {
      pointer-events: none;
      opacity: 0.7;
    }*/

    > label {
      position: relative;
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;

      margin-block: 4px;

      font-size: 14px;

      &:has(input[type="number"]) {
        cursor: text;

        &:hover {
          filter: none;
        }
      }
    }

    .unit {
      overflow: hidden;
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: flex-start;

      width: 67px;
      padding-inline-end: auto;

      font-size: 12px;
      font-weight: bold;

      background: var(--md-sys-color-secondary-container);
      border-radius: 16px;
    }

    input[type="number"] {
      display: flex;

      width: 5ch;
      height: 100%;
      padding-block: 4px;

      font-family: "Noto Sans Mono", monospace;
      color: var(--md-sys-color-on-secondary);
      text-align: end;

      background: var(--md-sys-color-secondary);
      border: none;

      &::-webkit-inner-spin-button {
        display: none;
      }

      &::after {
        content: "bleh";
      }

      &:focus {
        outline: none;
      }
    }
  }

  // stylelint-disable-next-line
  label:global(:has(.pending-changes)) {
    color: var(--md-sys-color-primary);

    &::before {
      position: absolute;
      font-size: 16px;
      top: 0.5em;
      right: 0.25em;
      content: "•";
    }
  }

  .row {
    display: flex;
    justify-content: space-evenly;
    margin-block: 8px;
  }

  input[type="file"] {
    display: none;
  }
</style>
