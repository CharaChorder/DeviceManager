<script lang="ts">
  import { browser, version } from "$app/environment";
  import { actionTooltip } from "$lib/title";
  import LL, { setLocale } from "$i18n/i18n-svelte";
  import { theme } from "$lib/preferences.js";
  import type { Locales } from "$i18n/i18n-types";
  import { detectLocale } from "$i18n/i18n-util";
  import { loadLocaleAsync } from "$i18n/i18n-util.async";
  import { tick } from "svelte";
  import {
    serialPort,
    sync,
    syncProgress,
    syncStatus,
  } from "$lib/serial/connection";
  import { fade, slide } from "svelte/transition";
  import ConnectPopup from "./ConnectPopup.svelte";

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

  function disconnect(event: MouseEvent) {
    if (event.shiftKey) {
      sync();
    } else {
      $serialPort?.close();
      $serialPort = undefined;
    }
  }
</script>

<footer>
  <ul>
    <li>
      <a
        {@attach actionTooltip("Branch")}
        href={import.meta.env.VITE_HOMEPAGE_URL}
        rel="noreferrer"
        target="_blank"><span class="icon">commit</span> v{version}</a
      >
    </li>
    <li>
      <a
        href="/ccos/{currentDevice ? `${currentDevice}/` : ''}"
        {@attach actionTooltip("Updates")}
      >
        CCOS {$serialPort?.version ?? "Updates"}
      </a>
    </li>
  </ul>
  <div
    class="sync-box"
    class:primary={!$serialPort}
    class:attention={$syncStatus !== "done"}
  >
    {#if !$serialPort}
      <button
        class="no-connection"
        id="connect-button"
        popovertarget="connect-popup"
        transition:slide={{ axis: "x" }}
        ><span class="icon">usb</span>{$LL.deviceManager.CONNECT()}</button
      >
      <div popover id="connect-popup">
        <ConnectPopup />
      </div>
    {:else}
      {#snippet disconnectTooltip()}
        Disconnect<br /><kbd class="icon">shift</kbd> Sync
      {/snippet}
      <button
        transition:slide={{ axis: "x" }}
        onclick={disconnect}
        {@attach actionTooltip(disconnectTooltip)}
        ><b
          >{$serialPort.company}
          {$serialPort.device}
          {$serialPort.chipset}</b
        ><span class="icon">usb_off</span></button
      >
    {/if}

    {#if $syncStatus === "downloading"}
      <progress
        transition:fade
        max={$syncProgress?.max ?? 1}
        value={$syncProgress?.current ?? 1}
      ></progress>
    {/if}
  </div>
  <ul>
    <li>
      <a
        href={import.meta.env.VITE_DISCORD_URL}
        rel="noreferrer"
        target="_blank"
      >
        <svg
          class="discord-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 126.64 96"
        >
          <path
            fill="currentColor"
            d="m81 0-3 7Q63 4 49 7l-4-7-26 8Q-4 45 1 80q14 10 32 16l6-11-10-5 2-2q33 13 64 0l3 2-11 5 7 11q17-5 32-16 4-40-19-72-12-5-26-8M42 65q-10-1-11-12 0-15 11-13c11 2 12 6 12 13q-1 11-12 12m42 0q-10-1-11-12 0-15 11-13c11 2 12 6 12 13q-1 11-12 12"
          /></svg
        >
        Discord</a
      >
    </li>
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
        {@attach actionTooltip($LL.profile.theme.COLOR_SCHEME())}
        type="color"
        bind:value={$theme.color}
      />
    </li>
    <li class="hide-forced-colors">
      {#if $theme.mode === "light"}
        <button
          {@attach actionTooltip($LL.profile.theme.DARK_MODE())}
          class="icon"
          onclick={switchTheme}
        >
          dark_mode
        </button>
      {:else if $theme.mode === "dark"}
        <button
          {@attach actionTooltip($LL.profile.theme.LIGHT_MODE())}
          class="icon"
          onclick={switchTheme}
        >
          light_mode
        </button>
      {/if}
    </li>
  </ul>
</footer>

<style lang="scss">
  @keyframes attention {
    0%,
    100% {
      filter: brightness(0.5);
    }
    50% {
      filter: brightness(1);
    }
  }

  $sync-border-radius: 16px;

  .discord-icon {
    margin: 5px;
    inline-size: 14px;
  }

  .sync-box {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    translate: 0;
    transition: all 250ms ease;
    border-radius: 24px;
    overflow: hidden;

    button {
      text-wrap: nowrap;
    }

    &.primary {
      translate: 0 -32px;
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    &.attention {
      animation: attention 2s infinite;
      border-radius: $sync-border-radius;
      color: var(--md-sys-color-primary);
    }
  }

  progress {
    $inset: 8px;
    position: absolute;
    opacity: 0.3;
    z-index: -1;
    inset: $inset;
    border-radius: #{$sync-border-radius - $inset};
    width: calc(100% - $inset * 2);
    height: calc(100% - $inset * 2);
    overflow: hidden;
  }

  progress::-webkit-progress-bar {
    background: var(--md-sys-color-background);
  }

  progress::-webkit-progress-value {
    background: var(--md-sys-color-primary);
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
