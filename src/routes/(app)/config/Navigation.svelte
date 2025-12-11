<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { canShare, triggerShare } from "$lib/share";
  import { action } from "$lib/title";
  import { activeProfile, serialPort } from "$lib/serial/connection";
  import LL from "$i18n/i18n-svelte";
  import EditActions from "./EditActions.svelte";
  import { page } from "$app/state";
  import { expoOut } from "svelte/easing";
</script>

<nav>
  <div class="actions">
    <EditActions />
  </div>

  <div>
    {#if $serialPort && $serialPort.profileCount > 1 && !page.route.id?.startsWith("/(app)/config/chords")}
      <div
        transition:fade={{ duration: 250, easing: expoOut }}
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
