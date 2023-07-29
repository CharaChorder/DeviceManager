<script lang="ts">
  import {serialPort, syncStatus} from "$lib/serial/connection"
  import {page} from "$app/stores"
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

  const training = [
    {slug: "cpm", title: "CPM - Characters Per Minute", icon: "music_note"},
    {slug: "chords", title: "ChM - Chords Mastered", icon: "piano"},
    {slug: "avg-wpm", title: "aWPM - Average Words Per Minute", icon: "avg_pace"},
    {slug: "sentences", title: "StM - Sentences Mastered", icon: "lyrics"},
    {slug: "top-wpm", title: "tWPM - Top Words Per Minute", icon: "speed"},
    {slug: "cm", title: "CM - Concepts Mastered", icon: "cognition"},
  ]

  $: if (browser && !canAutoConnect()) {
    connectButton?.click()
  }

  let connectButton: HTMLButtonElement
</script>

<nav>
  <a href="/" class="title">{$LL.TITLE()}</a>

  <div class="steps">
    {#each training as { slug, title, icon }}
      <a
        href="/train/{slug}/"
        {title}
        class="icon train {slug}"
        class:active={$page.url.pathname === `/train/${slug}/`}>{icon}</a
      >
    {/each}
  </div>

  <div class="actions">
    {#if $canShare}
      <button transition:fly={{x: -8}} class="icon" on:click={triggerShare}>share</button>
      <div transition:slide class="separator" />
    {/if}
    {#await import("$lib/components/PwaStatus.svelte") then { default: PwaStatus }}
      <PwaStatus />
    {/await}
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
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;

    margin-block: 8px;
    margin-inline: 16px;
  }

  .title {
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
    padding: 4px;

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

    &.active,
    &:active {
      color: var(--md-sys-color-on-primary);
      background: var(--md-sys-color-primary);
    }
  }

  .steps {
    position: absolute;
    left: 50%;
    translate: -50% 0;
    display: flex;

    > a.icon {
      aspect-ratio: unset;
      margin-inline: -4px;
      padding-inline: 16px;

      font-size: 24px;
      color: var(--md-sys-on-surface-variant);

      background: var(--md-sys-color-surface-variant);
      clip-path: polygon(25% 50%, 0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);
      border-radius: 0;

      &.active,
      &:active {
        color: var(--md-sys-color-on-tertiary);
        background: var(--md-sys-color-tertiary);

        &,
        ~ * {
          translate: 8px 0;
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .icon.account {
    font-size: 32px;
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
  }
</style>
