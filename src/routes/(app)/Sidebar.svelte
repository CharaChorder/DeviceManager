<script lang="ts">
  import { browser } from "$app/environment";
  import { LL } from "$i18n/i18n-svelte";
  import { popup } from "$lib/popup";
  import { userPreferences } from "$lib/preferences";
  import { serialPort, syncStatus } from "$lib/serial/connection";
  import { action } from "$lib/title";
  import BackupPopup from "./BackupPopup.svelte";
  import ConnectionPopup from "./ConnectionPopup.svelte";
  import { onMount } from "svelte";

  onMount(async () => {
    if (browser && !$userPreferences.autoConnect) {
      connectButton.click();
    }
  });

  let connectButton: HTMLButtonElement;
</script>

<div class="sidebar">
  <nav>
    <ul>
      <li><a href="/config/layout/" class="icon">tune</a></li>
      <li><a href="/learn" class="wip icon">school</a></li>
      <li><a href="/editor" class="wip icon">edit_document</a></li>
      <li><a href="/chat" class="wip icon">chat</a></li>
      <li><a href="/plugin" class="wip icon">code</a></li>
    </ul>
  </nav>
  <ul class="sidebar-footer">
    <li>
      <button
        bind:this={connectButton}
        use:action={{ title: $LL.deviceManager.TITLE() }}
        use:popup={ConnectionPopup}
        class="icon connect"
        class:error={$serialPort === undefined}
      >
        cable
      </button>
    </li>
    <li>
      <button
        use:action={{ title: $LL.backup.TITLE() }}
        use:popup={BackupPopup}
        class="icon {$syncStatus}"
      >
        account_circle
      </button>
    </li>
  </ul>
</div>

<style lang="scss">
  .sidebar {
    margin: 8px;
    padding-inline-end: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    grid-area: sidebar;
    border-right: 1px solid var(--md-sys-color-outline);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .wip {
    position: relative;
  }

  .wip::after {
    content: "experiment";
    font-size: 16px;
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: var(--md-sys-color-tertiary);
    color: var(--md-sys-color-on-tertiary);
    border-radius: 100%;
    padding: 2px;
  }
</style>
