<script>
  import {useRegisterSW} from "virtual:pwa-register/svelte"

  const {needRefresh, updateServiceWorker, offlineReady} = useRegisterSW()
</script>

{#if $needRefresh}
  <button title="Update ready" class="icon" on:click={() => updateServiceWorker(true)}>update</button>
{:else if $offlineReady}
  <div title="App can now be used offline" class="icon">offline_pin</div>
{:else}
  <div title="Waiting to be offline ready..." class="icon working">offline_bolt</div>
{/if}

<style lang="scss">
  button {
    cursor: pointer;
    color: var(--md-sys-color-on-background);
    background: transparent;
    border: none;
  }

  @keyframes working {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .working {
    animation: working 1s ease alternate-reverse infinite;
  }
</style>
