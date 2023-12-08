<script>
  import {serialPort} from "$lib/serial/connection"
  import {LL} from "../../i18n/i18n-svelte"
</script>

{#if $serialPort}
  <slot />
{:else}
  <p>{$LL.deviceManager.NO_DEVICE()}</p>
{/if}

<style lang="scss">
  p {
    margin: auto;
    opacity: 0.4;
  }
</style>
