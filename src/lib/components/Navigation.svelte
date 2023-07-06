<script>
  import {serialPort, syncing} from "$lib/serial/connection.js"
  import {browser} from "$app/environment"
  import {page} from "$app/stores"
</script>

<nav>
  <a href="/" class="title">dot i/o</a>

  <div class="steps">
    <a href="/" title="CPM - characters per minute" class="icon train cpm">music_note</a>
    <a href="/" title="ChM - chords mastered" class="icon train chords">piano</a>
    <a href="/" title="aWPM - average words per minute" class="icon test avg">avg_pace</a>
    <a href="/" title="StM - sentences mastered" class="icon train sentences">lyrics</a>
    <a href="/" title="tWPM - top words per minute" class="icon test top">speed</a>
    <a href="/" title="CM - concepts mastered" class="icon train concepts">cognition</a>
  </div>

  <div class="actions">
    {#await import("$lib/components/PwaStatus.svelte") then { default: PwaStatus }}
      <PwaStatus />
    {/await}
    {#if browser && !("serial" in navigator)}
      <abbr
        title="Your browser does not support serial connections. Try using Chrome instead."
        class="icon error"
      >
        warning
      </abbr>
    {/if}
    <a
      href="/device-manager/"
      title="Device Manager"
      class="icon connect"
      class:active={$page.url.pathname === "/device-manager/"}
      class:error={$serialPort === undefined}
      class:syncing={$syncing}
    >
      cable
    </a>
    <a href="/" title="Statistics" class="icon account">person</a>
  </div>
</nav>

<style lang="scss">
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

  @keyframes sync {
    from {
      rotate: 0deg;
    }

    to {
      rotate: -360deg;
    }
  }

  .connect::after {
    pointer-events: none;
    content: "sync";

    position: absolute;
    bottom: 0;
    left: 0;

    display: table-cell;

    padding-top: 0.5px;

    font-size: 16px;
    font-weight: 600;
    color: var(--md-sys-color-on-background);

    opacity: 0;
    background: var(--md-sys-color-background);
    border-radius: 50%;

    alignment-baseline: top;

    transition: opacity 250ms ease;
    animation: sync 1s linear infinite;
  }

  .connect:active::after,
  .connect.active::after {
    color: var(--md-sys-color-on-primary);
    background: var(--md-sys-color-primary);
  }

  .connect.syncing::after {
    opacity: 1;
  }
</style>
