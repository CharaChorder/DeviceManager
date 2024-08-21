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

  const routes = [
    [
      { href: "/config/chords/", icon: "dictionary", title: "Chords" },
      { href: "/config/layout/", icon: "keyboard", title: "Layout" },
      { href: "/config/settings/", icon: "tune", title: "Config" },
    ],
    [
      { href: "/learn", icon: "school", title: "Learn", wip: true },
      { href: "/learn", icon: "description", title: "Docs" },
      { href: "/editor", icon: "edit_document", title: "Editor", wip: true },
    ],
    [
      { href: "/chat", icon: "chat", title: "Chat", wip: true },
      { href: "/plugin", icon: "code", title: "Plugin", wip: true },
    ],
  ] satisfies { href: string; icon: string; title: string; wip?: boolean }[][];

  let connectButton: HTMLButtonElement;
</script>

<div class="sidebar">
  <nav>
    {#each routes as group}
      <ul>
        {#each group as { href, icon, title, wip }}
          <li>
            <a class:wip {href}>
              <div class="icon">{icon}</div>
              <div class="content">
                {title}
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/each}
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
    width: 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    grid-area: sidebar;
    border-right: 1px solid var(--md-sys-color-outline);
  }

  li {
    display: flex;
    justify-content: center;
  }

  a {
    display: flex;
    flex-direction: column;
    margin: 8px 0;
    font-size: 12px;

    &.wip {
      color: var(--md-sys-color-error);
      opacity: 0.5;
    }

    .icon {
      display: flex;
      justify-content: center;
      font-size: 24px;
    }

    > .content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul + ul::before {
    content: "";
    display: block;
    height: 1px;
    background: var(--md-sys-color-outline);
    margin: 16px 0;
  }
</style>
