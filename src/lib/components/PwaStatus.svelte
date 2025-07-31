<script>
  // @ts-expect-error no types here
  import { useRegisterSW } from "virtual:pwa-register/svelte";

  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW();
</script>

{#if $needRefresh}
  <button title="Update ready" onclick={() => updateServiceWorker(true)}
    >Update <span class="icon">update</span></button
  >
{:else if $offlineReady}
  <div title="App can now be used offline" class="icon">offline_pin</div>
{/if}

<style lang="scss">
  button {
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-background);
  }
</style>
