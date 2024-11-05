<script lang="ts">
  import { fly } from "svelte/transition";
  import { canShare, triggerShare } from "$lib/share";
  import { action } from "$lib/title";
  import LL from "$i18n/i18n-svelte";
  import EditActions from "./EditActions.svelte";
  import { sync, syncStatus } from "$lib/serial/connection";
</script>

<nav>
  <div class="actions">
    <EditActions />
  </div>

  <div class="actions">
    {#if $canShare}
      <button
        use:action={{ title: $LL.share.TITLE() }}
        transition:fly={{ x: -8 }}
        class="icon"
        onclick={triggerShare}>share</button
      >
      <button
        use:action={{ title: $LL.print.TITLE() }}
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
  </div>
</nav>

<style lang="scss">
  nav {
    display: grid;
    grid-template-columns: 1fr 1fr;

    width: calc(min(100%, 28cm));
    margin-block: 8px;
    margin-inline: auto;
    padding-inline: 16px;
  }

  @keyframes syncing {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .syncing {
    transform-origin: 50% 49%;
    animation: syncing 1s linear infinite;
  }

  .title {
    display: flex;
    align-items: center;

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
    padding: 0;

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
  }

  .actions {
    display: flex;
    align-items: center;

    &:last-child {
      justify-content: flex-end;
    }
  }

  :disabled {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
