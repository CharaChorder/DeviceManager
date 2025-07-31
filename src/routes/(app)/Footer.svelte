<script lang="ts">
  import { browser, version } from "$app/environment";
  import { action } from "$lib/title";
  import LL, { setLocale } from "$i18n/i18n-svelte";
  import { theme } from "$lib/preferences.js";
  import type { Locales } from "$i18n/i18n-types";
  import { detectLocale, locales } from "$i18n/i18n-util";
  import { loadLocaleAsync } from "$i18n/i18n-util.async";
  import { tick } from "svelte";
  import SyncOverlay from "./SyncOverlay.svelte";
  import {
    initSerial,
    serialPort,
    sync,
    syncProgress,
    syncStatus,
  } from "$lib/serial/connection";
  import { fade, slide } from "svelte/transition";
  import { showConnectionFailedDialog } from "$lib/dialogs/connection-failed-dialog";

  let locale = $state(
    (browser && (localStorage.getItem("locale") as Locales)) || detectLocale(),
  );

  let currentDevice = $derived(
    $serialPort
      ? `${$serialPort.device.toLowerCase()}_${$serialPort.chipset.toLowerCase()}`
      : undefined,
  );

  $effect(() => {
    if (!browser) return;
    localStorage.setItem("locale", locale);
    loadLocaleAsync(locale).then(() => {
      setLocale(locale);
    });
  });

  function switchTheme() {
    const mode = $theme.mode === "light" ? "dark" : "light";
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        $theme.mode = mode;
        await tick();
      });
    } else {
      $theme.mode = mode;
    }
  }

  async function connect() {
    try {
      await initSerial(true);
    } catch (error) {
      console.error(error);
      await showConnectionFailedDialog(String(error));
    }
  }

  function disconnect(event: MouseEvent) {
    if (event.shiftKey) {
      sync();
    } else {
      $serialPort?.forget();
      $serialPort = undefined;
    }
  }

  let languageSelect: HTMLSelectElement;
</script>

<footer>
  <ul>
    <li>
      <a
        use:action={{ title: "Branch" }}
        href={import.meta.env.VITE_HOMEPAGE_URL}
        rel="noreferrer"
        target="_blank"><span class="icon">commit</span> v{version}</a
      >
    </li>
    <li>
      <a
        href="/ccos/{currentDevice ? `${currentDevice}/` : ''}"
        use:action={{ title: "Updates" }}
      >
        CCOS {$serialPort?.version ?? "Updates"}
      </a>
    </li>
  </ul>
  <div class="sync-box">
    {#if !$serialPort}
      <button class="warning" onclick={connect} transition:slide={{ axis: "x" }}
        ><span class="icon">usb</span>{$LL.deviceManager.CONNECT()}</button
      >
    {:else}
      <button
        transition:slide={{ axis: "x" }}
        onclick={disconnect}
        use:action={{
          title: "Disconnect<br><kbd class='icon'>shift</kbd> Sync",
        }}
        ><b
          >{$serialPort.company}
          {$serialPort.device}
          {$serialPort.chipset}</b
        ><span class="icon">usb_off</span></button
      >
    {/if}

    {#if $syncStatus !== "done"}
      <progress
        transition:fade
        max={$syncProgress?.max ?? 1}
        value={$syncProgress?.current ?? 1}
      ></progress>
    {/if}
  </div>
  <ul>
    <li>
      <a href={import.meta.env.VITE_BUGS_URL} rel="noreferrer" target="_blank"
        ><span class="icon">bug_report</span> Bugs</a
      >
    </li>
    <li>
      <a href={import.meta.env.VITE_STORE_URL} rel="noreferrer" target="_blank"
        ><span class="icon">shopping_bag</span> Store</a
      >
    </li>
    <li class="hide-forced-colors">
      <input
        use:action={{ title: $LL.profile.theme.COLOR_SCHEME() }}
        type="color"
        bind:value={$theme.color}
      />
    </li>
    <li class="hide-forced-colors">
      {#if $theme.mode === "light"}
        <button
          use:action={{ title: $LL.profile.theme.DARK_MODE() }}
          class="icon"
          onclick={switchTheme}
        >
          dark_mode
        </button>
      {:else if $theme.mode === "dark"}
        <button
          use:action={{ title: $LL.profile.theme.LIGHT_MODE() }}
          class="icon"
          onclick={switchTheme}
        >
          light_mode
        </button>
      {/if}
    </li>
    <!--<li>
      <div
        role="button"
        class="icon"
        use:action={{ title: $LL.profile.LANGUAGE() }}
        onclick={() => languageSelect.click()}
      >
        translate

        <select bind:value={locale} bind:this={languageSelect}>
          {#each locales as code}
            <option value={code}>{code}</option>
          {/each}
        </select>
      </div>
    </li>-->
  </ul>
</footer>

<style lang="scss">
  .sync-box {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;

    button {
      text-wrap: nowrap;
    }
  }

  progress {
    position: absolute;
    right: 16px;
    bottom: 0;
    left: 16px;
    z-index: -1;
    border-radius: 4px;
    width: calc(100% - 32px);
    height: 8px;
    overflow: hidden;
  }

  progress::-webkit-progress-bar {
    background: var(--md-sys-color-background);
  }

  progress::-webkit-progress-value {
    background: var(--md-sys-color-primary);
  }

  .warning {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-error);
  }

  input[type="color"] {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: 0;
    border: none;
    border-radius: 50%;

    background: transparent;
    padding: 0;

    inline-size: 20px;
    block-size: 20px;

    overflow: hidden;

    color: inherit;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
    }
  }

  footer {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    justify-content: center;
    align-items: center;

    opacity: 0.4;
    padding: 8px;
    padding-inline-end: 16px;
    padding-block-start: 0;

    width: 100%;

    @media (prefers-contrast: more) {
      opacity: 0.8;
    }

    @media (forced-colors: active) {
      opacity: unset;
    }
  }

  ul {
    display: flex;
    align-items: center;
    gap: 8px;

    margin: 0;
    padding: 0;

    list-style: none;

    &:last-child {
      justify-content: flex-end;
    }
  }

  ul:last-child {
    gap: 12px;

    button {
      height: 24px;
      font-size: 20px;
    }
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;

    padding-inline: 12px;

    font-size: 12px;
    text-decoration: none;
  }

  .icon {
    font-size: 16px;
  }

  @media (forced-colors: active) {
    .hide-forced-colors {
      display: none;
    }
  }
</style>
