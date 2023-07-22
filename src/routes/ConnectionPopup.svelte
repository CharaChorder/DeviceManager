<script>
  import {initSerial, serialPort} from "$lib/serial/connection"
  import {browser} from "$app/environment"
  import {getViablePorts} from "$lib/serial/device"
</script>

<h2>Devices</h2>

<div class="row">
  <button disabled={$serialPort === undefined}><span class="icon">restart_alt</span>Reboot</button>
  <button disabled={$serialPort === undefined}><span class="icon">rule_settings</span>Bootloader</button>
</div>
{#if browser}
  {#await ($serialPort, getViablePorts()) then ports}
    <div class="row">
      {#if ports.length === 0}
        <button class="secondary" on:click={initSerial}>
          <span class="icon">usb</span>Pair
        </button>
      {:else if $serialPort}
        <button
          class="secondary"
          on:click={() => {
            $serialPort.forget()
            $serialPort = undefined
          }}><span class="icon">usb</span>Unpair</button
        >
      {:else}
        <button class="secondary" on:click={initSerial}><span class="icon">usb</span>Connect</button>
      {/if}
      {#if $serialPort}
        <button
          on:click={() => {
            $serialPort.disconnect()
            $serialPort = undefined
          }}><span class="icon">usb</span>Disconnect</button
        >
      {/if}
    </div>
  {/await}
{/if}

<style lang="scss">
  .row {
    display: flex;
    gap: 8px;
    height: fit-content;
  }

  button {
    cursor: pointer;

    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;

    height: 48px;
    padding: 8px;
    padding-inline-end: 16px;

    font-size: 1rem;
    color: var(--md-sys-color-on-background);

    background: transparent;
    border: none;
    border-radius: 32px;

    transition: all 250ms ease;

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }

    &.icon {
      aspect-ratio: 1;
      padding-inline-end: 8px;
      font-size: 24px;
      border-radius: 50%;
    }

    &.secondary {
      color: var(--md-sys-color-on-secondary);
      background: var(--md-sys-color-secondary);
    }

    &:active:not(:disabled) {
      color: var(--md-sys-color-on-surface-variant);
      background: var(--md-sys-color-surface-variant);
    }
  }

  .device-grid {
    contain: size;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 16px;
  }
</style>
