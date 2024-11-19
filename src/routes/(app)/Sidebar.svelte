<script lang="ts">
  import { page } from "$app/stores";

  const routes = [
    [
      {
        href: "/config/settings/",
        icon: "cable",
        title: "Device",
        primary: true,
      },
      { href: "/config/chords/", icon: "dictionary", title: "Library" },
      { href: "/config/layout/", icon: "keyboard", title: "Layout" },
    ],
    [
      // { href: "/learn", icon: "school", title: "Learn", wip: true },
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
      { href: "/editor", icon: "edit_document", title: "Editor", wip: true },
      { href: "https://chat.dev.charachorder.io", icon: "chat", title: "Chat", wip: true },
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
  }[][];

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
      padding: 8px;
      border-radius: 8px;

      transition: all 250ms ease;
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
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border-radius: 50%;
      }
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
