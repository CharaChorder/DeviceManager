<script>
  import {initSerial, serialPort} from "$lib/serial/connection.js"
  import Terminal from "$lib/components/Terminal.svelte"
  import {browser} from "$app/environment"
</script>

<svelte:head>
  <title>dot i/o device manager</title>
</svelte:head>

<h1>Device Manager</h1>

<div class="device-grid">
  <div class="row">
    {#if $serialPort === undefined}
      <button class="secondary" disabled={browser && !("serial" in navigator)} on:click={initSerial}>
        <span class="icon">usb</span>Pair
      </button>
    {/if}
    <button title="Reboot" class="icon" disabled={$serialPort === undefined}>restart_alt</button>
    <button title="Reboot to bootloader" class="icon" disabled={$serialPort === undefined}
      >rule_settings</button
    >
  </div>
  <div class="terminal">
    <Terminal />
  </div>
</div>

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

    padding: 8px;
    padding-inline-end: 16px;

    font-size: 1rem;
    color: var(--md-sys-color-on-background);

    background: transparent;
    border: none;
    border-radius: 1rem;

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

  .terminal {
    flex-grow: 1;
  }

  .device-grid {
    contain: size;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 16px;

    width: calc(min(100%, 28cm));
    height: 100%;
  }
</style>
