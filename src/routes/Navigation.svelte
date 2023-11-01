<script lang="ts">
  import {serialPort, syncStatus} from "$lib/serial/connection"
  import {slide, fly} from "svelte/transition"
  import {canShare, triggerShare} from "$lib/share"
  import {popup} from "$lib/popup"
  import BackupPopup from "./BackupPopup.svelte"
  import ConnectionPopup from "./ConnectionPopup.svelte"
  import {canAutoConnect} from "$lib/serial/device"
  import {browser} from "$app/environment"
  import {userPreferences} from "$lib/preferences"
  import LL from "../i18n/i18n-svelte"
  import Profile from "./Profile.svelte"
  import ConfigTabs from "./ConfigTabs.svelte"
  import EditActions from "./EditActions.svelte"

  $: if (browser && !canAutoConnect()) {
    connectButton?.click()
  }

  let connectButton: HTMLButtonElement
</script>

<nav>
  <div class="actions">
    <EditActions />
  </div>

  <ConfigTabs />

  <div class="actions">
    {#if $canShare}
      <button transition:fly={{x: -8}} class="icon" on:click={triggerShare}>share</button>
      <div transition:slide class="separator" />
    {/if}
    {#if import.meta.env.TAURI_FAMILY === undefined}
      {#await import("$lib/components/PwaStatus.svelte") then { default: PwaStatus }}
        <PwaStatus />
      {/await}
    {/if}
    {#if $serialPort}
      <button title={$LL.backup.TITLE()} use:popup={BackupPopup} class="icon {$syncStatus}">
        {#if $syncStatus === "downloading"}
          backup
        {:else if $syncStatus === "uploading"}
          cloud_download
        {:else if $userPreferences.backup}
          cloud_done
        {:else}
          cloud_off
        {/if}
      </button>
    {/if}
    <button
      bind:this={connectButton}
      title="Devices"
      use:popup={ConnectionPopup}
      class="icon connect"
      class:error={$serialPort === undefined}
    >
      cable
    </button>
    <button title={$LL.profile.TITLE()} use:popup={Profile} class="icon account">person</button>
  </div>
</nav>

<style lang="scss">
  @keyframes sync {
    0% {
      scale: 1 1;
      opacity: 1;
    }

    85% {
      scale: 1 0;
      opacity: 1;
    }

    86% {
      scale: 1 1;
      opacity: 0;
    }

    100% {
      scale: 1 1;
      opacity: 1;
    }
  }

  .uploading::after,
  .downloading::after {
    content: "";

    position: absolute;
    top: 12px;
    left: 50%;
    transform-origin: top;
    translate: -50% 0;

    width: 8px;
    height: 10px;

    background: var(--md-sys-color-background);

    animation: sync 1s linear infinite;
  }

  .uploading::after {
    transform-origin: bottom;
  }

  .downloading.active::after,
  .uploading.active::after {
    background: var(--md-sys-color-primary);
  }

  .sync.downloading::after {
    top: 10px;
    transform-origin: bottom;
    border-radius: 4px;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: var(--md-sys-color-outline-variant);
  }

  nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 4px;

    width: calc(min(100%, 28cm));
    margin-block: 8px;
    margin-inline: auto;
    padding-inline: 16px;
  }

  .title {
    display: flex;
    align-items: center;

    margin-block: 0;

    font-size: 1.5rem;
    font-weight: bold;
    color: var(--md-sys-color-primary);
    text-decoration: none;
  }

  .icon {
    cursor: pointer;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    aspect-ratio: 1;
    padding: 2px;

    color: inherit;
    text-decoration: none;

    background: transparent;
    border: none;
    border-radius: 50%;

    transition: all 250ms ease;

    &.error {
      color: var(--md-sys-color-on-error);
      background: var(--md-sys-color-error);
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;

    &:last-child {
      justify-content: flex-end;
    }
  }

  .icon.account {
    font-size: 32px;
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
  }

  :disabled {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
