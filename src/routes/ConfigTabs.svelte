<script>
  import {page} from "$app/stores"
  import LL from "../i18n/i18n-svelte"

  $: paths = [
    {href: "/config/chords/", title: $LL.configure.chords.TITLE(), icon: "piano"},
    {href: "/config/layout/", title: $LL.configure.layout.TITLE(), icon: "keyboard"},
    {href: "/config/settings/", title: $LL.configure.settings.TITLE(), icon: "settings"},
  ]
</script>

<nav>
  {#each paths as { href, title, icon }}
    <a {href} class:active={$page.url.pathname.startsWith(href)}>
      <span class="icon">{icon}</span>
      {title}
    </a>
  {/each}
</nav>

<slot />

<style lang="scss">
  nav {
    display: flex;
    gap: 8px;

    padding: 8px;

    background: var(--md-sys-color-surface-variant);
    border: none;
    border-radius: 32px;
  }

  a {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;

    margin: 0;
    padding: 8px;
    padding-inline: 16px;

    font-weight: 600;
    color: var(--md-sys-color-on-surface-variant);
    text-decoration: none;

    border-radius: 24px;

    transition: all 250ms ease;
  }

  a.active {
    --icon-fill: 1;

    color: var(--md-sys-color-on-primary);
    background: var(--md-sys-color-primary);
  }
</style>
