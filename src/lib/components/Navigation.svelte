<script>
  import {serialPort, syncStatus} from "$lib/serial/connection"
  import {browser} from "$app/environment"
  import {page} from "$app/stores"

  const training = [
    {slug: "cpm", title: "CPM - Characters Per Minute", icon: "music_note"},
    {slug: "chords", title: "ChM - Chords Mastered", icon: "piano"},
    {slug: "avg-wpm", title: "aWPM - Average Words Per Minute", icon: "avg_pace"},
    {slug: "sentences", title: "StM - Sentences Mastered", icon: "lyrics"},
    {slug: "top-wpm", title: "tWPM - Top Words Per Minute", icon: "speed"},
    {slug: "cm", title: "CM - Concepts Mastered", icon: "cognition"},
  ]
</script>

<nav>
  <a href="/" class="title">dot i/o</a>

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
    {#if $syncStatus === "downloading"}
      <abbr title="Backing up settings" class="icon sync backup">backup</abbr>
    {:else if $syncStatus === "uploading"}
      <abbr title="Saving settings" class="icon sync save">cloud_download</abbr>
    {:else if $syncStatus === "done"}
      <abbr title="Device settings are up-to-date" class="icon">cloud_done</abbr>
    {/if}
    <a
      href="/config/"
      title="Device Manager"
      class="icon connect"
      class:active={$page.url.pathname.startsWith("/config/")}
      class:error={$serialPort === undefined}
    >
      cable
    </a>
    <a href="/" title="Statistics" class="icon account">person</a>
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

  .sync::after {
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

  .sync.save::after {
    transform-origin: bottom;
    top: 10px;
    border-radius: 4px;
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
</style>
