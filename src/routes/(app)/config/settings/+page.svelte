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
  <nav>
    {#if $deviceMeta}
      {#each $deviceMeta?.settings as category}
        <a href={`#${category.name}`}>{titlecase(category.name)}</a>
      {/each}
    {/if}
    <a href="#backup">Backup</a>
  </nav>
  <div class="content">
    <label
      >{$LL.deviceManager.AUTO_CONNECT()}<input
        type="checkbox"
        use:preference={"autoConnect"}
      /></label
    >
    {#if $deviceMeta}
      {#each $deviceMeta.settings as category}
        <fieldset id={category.name}>
          <legend>
            {titlecase(category.name)}
          </legend>
          {#if category.description}
            <p>{category.description}</p>
          {/if}
          {#each category.items as item}
            {#if item.unit === "H"}
              <label
                ><input type="color" use:setting={{ id: item.id }} /> Color</label
              >
            {:else if item.unit !== "S" && item.unit !== "B"}
              <label class:enable-item={item.name === "enable"}
                >{#if item.enum}
                  <select class="value" use:setting={{ id: item.id }}>
                    {#each item.enum as name, value}
                      <option {value}>{titlecase(name)}</option>
                    {/each}
                  </select>
                {:else if item.range[0] === 0 && item.range[1] === 1}
                  <input
                    class="value"
                    type="checkbox"
                    use:setting={{ id: item.id }}
                  />
                {:else}
                  <div class="value unit">
                    <input
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
                    />{item.unit}
                  </div>
                {/if}
                <div class="title">{titlecase(item.name)}</div>
                {#if item.description}
                  <div class="description">{item.description}</div>
                {/if}
              </label>
            {/if}
          {/each}
        </fieldset>
      {/each}
    {/if}

    <fieldset id="backup">
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

    <div class="footer">
      {#if $serialPort}
        {#if $deviceMeta?.factoryDefaults?.settings}
          <button
            use:action={{ title: "Reset Settings" }}
            transition:fly={{ x: -8 }}
            onclick={() =>
              restoreFromFile($deviceMeta.factoryDefaults!.settings)}
            ><span class="icon">reset_settings</span>Reset Settings</button
          >
        {/if}
        <button popovertarget="reset-device" popovertargetaction="toggle"
          >Recovery...</button
        >
        <div id="reset-device" popover="auto"><ResetPopup /></div>
      {/if}
    </div>
  </div>
</section>

<style lang="scss">
  section {
    display: grid;
    grid-template-columns: auto 1fr;
    max-width: 100%;
    overflow: hidden;
  }

  .content {
    max-width: 20cm;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  legend {
    position: relative;
    padding: 0;
    color: var(--md-sys-color-primary);
    font-weight: bold;
    font-size: 32px;
  }

  input[type="checkbox"] {
    font-size: 12px !important;
  }

  fieldset {
    display: flex;
    position: relative;
    flex-direction: column;
    margin-inline: 0;
    margin-block-end: 32px;
    border: none;

    width: 100%;

    > p {
      padding-inline-start: 16px;
    }

    > label {
      display: flex;
      position: relative;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: center;
      appearance: none;

      margin-block: 4px;
      padding: 8px;
      width: fit-content;
      height: auto;
      font-weight: normal;

      font-size: 14px;

      &:has(input[type="number"]) {
        cursor: text;

        &:hover {
          filter: none;
        }
      }

      &.enable-item {
        margin-inline-start: 8px;
        background: var(--md-sys-color-surface-variant);
        padding-inline-start: 8px;
        padding-inline-end: 16px;
        color: var(--md-sys-color-on-surface-variant);
      }
    }

    .title {
      margin-inline-start: 16px;
      font-weight: 600;
    }

    .description {
      width: 100%;
      font-size: 12px;
      text-wrap: wrap;
      white-space: normal;
    }

    .unit {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 4px;
      border-radius: 16px;

      background: var(--md-sys-color-secondary-container);
      padding-inline-end: auto;

      width: 67px;
      overflow: hidden;
      font-weight: bold;

      font-size: 12px;
    }

    input[type="number"] {
      display: flex;
      border: none;

      background: var(--md-sys-color-secondary);
      padding-block: 4px;

      width: 5ch;
      height: 100%;
      color: var(--md-sys-color-on-secondary);

      font-family: "Noto Sans Mono", monospace;
      text-align: end;

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

  select {
    appearance: none;
    border: none;
    border-radius: 8px;
    background: var(--md-sys-color-secondary);
    padding: 4px 8px;
    font: inherit;
    font-size: 12px;
  }

  // stylelint-disable-next-line
  label:global(:has(.pending-changes)) {
    color: var(--md-sys-color-primary);

    &::before {
      position: absolute;
      top: 0.5em;
      right: 0.25em;
      content: "•";
      font-size: 16px;
    }
  }

  .row {
    display: flex;
    justify-content: space-evenly;
    margin-block: 8px;
    width: fit-content;
  }

  input[type="file"] {
    display: none;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
