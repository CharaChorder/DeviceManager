<script>
  import {base} from "$app/paths"
  import {page} from "$app/stores"
</script>

<nav>
  <a href="{base}/config/chords/" class:active={$page.url.pathname.endsWith("chords/")}>
    <span class="icon">piano</span>Chords
  </a>
  <a href="{base}/config/layout/" class:active={$page.url.pathname.endsWith("layout/")}>
    <span class="icon">keyboard</span>
    Layout
  </a>
  <a href="{base}/config/settings/" class:active={$page.url.pathname.endsWith("settings/")}>
    <span class="icon">settings</span>
    Settings
  </a>
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

    font-weight: 800;
    color: var(--md-sys-color-on-surface-variant);
    text-decoration: none;

    border-radius: 24px;

    transition: all 250ms ease;
  }

  a.active {
    color: var(--md-sys-color-on-primary);
    background: var(--md-sys-color-primary);
  }
</style>
