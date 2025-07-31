<script lang="ts">
  import {
    serialPort,
    syncProgress,
    syncStatus,
    sync,
  } from "$lib/serial/connection";
  import LL from "$i18n/i18n-svelte";
  import { slide } from "svelte/transition";
</script>

<div class="container">
  {#if $syncStatus !== "done"}
    <div transition:slide>
      <progress
        max={$syncProgress?.max ?? 1}
        value={$syncProgress?.current ?? 1}
      ></progress>
      {#if $syncStatus === "downloading"}
        <div>{$LL.sync.TITLE_READ()}</div>
      {:else}
        <div>{$LL.sync.TITLE_WRITE()}</div>
      {/if}
    </div>
  {:else if $serialPort}
    <button transition:slide onclick={sync}
      ><span class="icon">refresh</span>{$LL.sync.RELOAD()}</button
    >
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  div {
    font-size: 12px;
  }

  progress {
    border-radius: 4px;
    width: 100%;
    height: 8px;
    overflow: hidden;
  }

  progress::-webkit-progress-bar {
    background: var(--md-sys-color-background);
  }

  progress::-webkit-progress-value {
    transition: width 2s ease;
    background: var(--md-sys-color-primary);
  }
</style>
