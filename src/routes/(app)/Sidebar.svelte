<script lang="ts">
  import { page } from "$app/stores";
  import { deviceMeta } from "$lib/serial/connection";

  let routes = $derived([
    [
      {
        href: "/config/settings/",
        icon: "cable",
        title: "Device",
        primary: true,
      },
      { href: "/config/chords/", icon: "dictionary", title: "Library" },
      { href: "/config/layout/", icon: "keyboard", title: "Layout" },
      ...($deviceMeta?.recipes
        ? [{ href: "/recipes", icon: "skillet", title: "Cookbook" }]
        : []),
    ],
    [
      {
        href: import.meta.env.VITE_LEARN_URL,
        icon: "school",
        title: "Learn",
        external: true,
      },
      {
        href: import.meta.env.VITE_DOCS_URL,
        icon: "description",
        title: "Docs",
        external: true,
      },
      {
        href: "https://voicebox.charachorder.io/",
        icon: "text_to_speech",
        title: "Voicebox",
        external: true,
      },
    ],
    [
      { href: "/editor", icon: "edit_document", title: "Editor", wip: true },
      { href: "/chat", icon: "chat", title: "Chat", wip: true },
      { href: "/learn", icon: "school", title: "Learn", wip: true },
    ],
    /*[
      { href: "/plugin", icon: "code", title: "Plugin", wip: true },
    ],*/
  ] satisfies {
    href: string;
    icon: string;
    title: string;
    wip?: boolean;
    external?: boolean;
    primary?: boolean;
  }[][]);

  let connectButton: HTMLButtonElement;
</script>

<div class="sidebar">
  <nav>
    {#each routes as group}
      <ul>
        {#each group as { href, icon, title, wip, external }}
          <li>
            <a
              class:wip
              {href}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
              class:active={$page.url.pathname.startsWith(href)}
            >
              <div class="icon">
                {icon}
              </div>
              <div class="content">
                {title}
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/each}
  </nav>
</div>

<style lang="scss">
  .sidebar {
    display: flex;

    grid-area: sidebar;
    flex-direction: column;
    justify-content: space-between;
    margin: 8px;
    border-right: 1px solid var(--md-sys-color-outline);
    padding-inline-end: 8px;
    width: 64px;
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
      opacity: 0.5;
      color: var(--md-sys-color-error);
    }

    .icon {
      display: flex;
      justify-content: center;

      transition: all 250ms ease;
      border-radius: 8px;
      padding: 8px;
      font-size: 24px;
    }

    > .content {
      display: flex;
      justify-content: center;
      align-items: center;
      translate: 0 -8px;
      transition: all 250ms ease;
    }

    &.active {
      > .content {
        translate: 0;
      }

      .icon {
        border-radius: 50%;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ul + ul::before {
    display: block;
    margin: 16px 0;
    background: var(--md-sys-color-outline);
    height: 1px;
    content: "";
  }
</style>
