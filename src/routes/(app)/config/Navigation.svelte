<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { canShare, triggerShare } from "$lib/share";
  import { actionTooltip } from "$lib/title";
  import { activeProfile, serialPort } from "$lib/serial/connection";
  import LL from "$i18n/i18n-svelte";
  import EditActions from "./EditActions.svelte";
  import { page } from "$app/state";
  import { expoOut } from "svelte/easing";
  import {
    createChordBackup,
    createLayoutBackup,
    createSettingsBackup,
    downloadFile,
    restoreBackup,
  } from "$lib/backup/backup";

  const routeOrder = [
    "/(app)/config/settings",
    "/(app)/config/chords",
    "/(app)/config/layout",
  ];

  let pageIndex = $derived(
    routeOrder.findIndex((it) => page.route.id?.startsWith(it)),
  );
  let importExport: HTMLDivElement | undefined = $state(undefined);

  $effect(() => {
    pageIndex;
    importExport?.animate(
      [
        { transform: "translateX(0)", opacity: 1 },
        { transform: "translateX(-8px)", opacity: 0, offset: 0.2 },
        { transform: "translateX(8px)", opacity: 0, offset: 0.7 },
        { transform: "translateX(0)", opacity: 1 },
      ],
      {
        duration: 1500,
        easing: "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    );
  });

  function importBackup(event: Event) {
    switch (pageIndex) {
      case 0:
        restoreBackup(event, "settings");
        break;
      case 1:
        restoreBackup(event, "chords");
        break;
      case 2:
        restoreBackup(event, "layout");
        break;
    }
    (event.target as HTMLInputElement).value = "";
  }

  function exportBackup() {
    switch (pageIndex) {
      case 0:
        downloadFile(createSettingsBackup());
        break;
      case 1:
        downloadFile(createChordBackup());
        break;
      case 2:
        downloadFile(createLayoutBackup());
        break;
    }
  }
</script>

<nav>
  <div class="actions">
    <EditActions />
  </div>

  <div class="profiles">
    {#if $serialPort && $serialPort.profileCount > 1 && !page.route.id?.startsWith("/(app)/config/chords")}
      <div
        transition:fly={{ y: -8, duration: 250, easing: expoOut }}
        class="profiles"
      >
        {#each Array.from({ length: $serialPort.profileCount }, (_, i) => i) as profile}
          <label
            ><input
              type="radio"
              name="profile"
              checked={profile == $activeProfile}
              onclick={() => ($activeProfile = profile)}
            />{String.fromCodePoint("A".codePointAt(0)! + profile)}</label
          >
        {/each}
      </div>
    {/if}
  </div>

  <div class="actions">
    {#if $canShare}
      <button
        {@attach actionTooltip($LL.share.TITLE())}
        transition:fly={{ x: -8 }}
        class="icon"
        onclick={triggerShare}>share</button
      >
      <button
        {@attach actionTooltip($LL.print.TITLE())}
        transition:fly={{ x: -8 }}
        class="icon"
        onclick={() => print()}>print</button
      >
    {/if}
    {#if import.meta.env.TAURI_FAMILY === undefined}
      {#await import("$lib/components/PwaStatus.svelte") then { default: PwaStatus }}
        <PwaStatus />
      {/await}
    {/if}
    <div class="import-export" bind:this={importExport}>
      <label
        ><input type="file" oninput={importBackup} />
        <span class="icon">upload_file</span>Import</label
      >
      <button onclick={exportBackup}
        ><span class="icon">file_save</span>Export</button
      >
    </div>
  </div>
</nav>

<style lang="scss">
  .profiles {
    display: flex;
    justify-content: center;
  }

  input[type="file"] {
    display: none;
  }

  .import-export {
    display: flex;
  }

  nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    margin-inline: auto;
    margin-block: 8px;
    padding-inline: 16px;

    width: calc(min(100%, 28cm));
  }

  .icon {
    display: flex;

    position: relative;
    justify-content: center;
    align-items: center;

    transition: all 250ms ease;
    cursor: pointer;
    border: none;
    border-radius: 50%;

    background: transparent;
    padding: 0;

    aspect-ratio: 1;

    color: inherit;
    text-decoration: none;
  }

  .actions {
    display: flex;
    align-items: center;

    &:last-child {
      justify-content: flex-end;
    }
  }

  .profiles {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
  }

  :disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
