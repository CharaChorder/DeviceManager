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
  import {action} from "$lib/title"
  import LL from "../i18n/i18n-svelte"
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
      <button
        use:action={{title: $LL.share.TITLE()}}
        transition:fly={{x: -8}}
        class="icon"
        on:click={triggerShare}>share</button
      >
      <button
        use:action={{title: $LL.print.TITLE()}}
        transition:fly={{x: -8}}
        class="icon"
        on:click={() => print()}>print</button
      >
      <div transition:slide class="separator" />
    {/if}
    {#if import.meta.env.TAURI_FAMILY === undefined}
      {#await import("$lib/components/PwaStatus.svelte") then { default: PwaStatus }}
        <PwaStatus />
      {/await}
    {/if}
    {#if $serialPort}
      <button use:action={{title: $LL.backup.TITLE()}} use:popup={BackupPopup} class="icon {$syncStatus}">
        {#if $userPreferences.backup}
          history
        {:else}
          history_toggle_off
        {/if}
      </button>
    {/if}
    <button
      bind:this={connectButton}
      use:action={{title: $LL.deviceManager.TITLE()}}
      use:popup={ConnectionPopup}
      class="icon connect"
      class:error={$serialPort === undefined}
    >
      cable
    </button>
  </div>
</nav>

<style lang="scss">
  .separator {
    width: 1px;
    height: 24px;
    margin-inline: 4px;
    background: var(--md-sys-color-outline-variant);
  }

  nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;

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
    padding: 0;

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
    align-items: center;

    &:last-child {
      justify-content: flex-end;
    }
  }

  :disabled {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
