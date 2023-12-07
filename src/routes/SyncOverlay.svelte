<script lang="ts">
  import {syncProgress, syncStatus} from "$lib/serial/connection"
  import LL from "../i18n/i18n-svelte"
  import {fly} from "svelte/transition"
</script>

{#if $syncStatus !== "done"}
  <div transition:fly={{y: 40}}>
    <progress max={$syncProgress?.max ?? 1} value={$syncProgress?.current ?? 1}></progress>
    {#if $syncStatus === "downloading"}
      <div>{$LL.sync.TITLE_READ()}</div>
    {:else}
      <div>{$LL.sync.TITLE_WRITE()}</div>
    {/if}
  </div>
{/if}

<style lang="scss">
  div {
    font-size: 12px;
  }

  progress {
    overflow: hidden;
    width: 100%;
    height: 8px;
    border-radius: 4px;
  }

  progress::-webkit-progress-bar {
    background: var(--md-sys-color-background);
  }

  progress::-webkit-progress-value {
    background: var(--md-sys-color-primary);
  }
</style>
