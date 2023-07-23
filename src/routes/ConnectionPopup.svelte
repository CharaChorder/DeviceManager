<script lang="ts">
  import {initSerial, serialPort} from "$lib/serial/connection"
  import {browser} from "$app/environment"
  import {getViablePorts} from "$lib/serial/device"
  import {slide, fade} from "svelte/transition"
  import {preference} from "$lib/preferences"

  let connectDialog = false
  let powerDialog = false
</script>

<section>
  <h2>Device</h2>

  {#if $serialPort}
    <p transition:slide>
      {$serialPort.deviceId}
      <br />
      Version {$serialPort.version}
    </p>
  {/if}

  {#if browser}
    <div class="row">
      <button
        class:secondary={$serialPort}
        class:error={!$serialPort}
        on:click={() => (connectDialog = !connectDialog)}
      >
        {#if $serialPort}
          <span class="icon">usb</span>
        {:else}
          <span class="icon">error</span>
        {/if}
        Connection
        <span class="icon">chevron_right</span>
      </button>
      <button class="icon" disabled={$serialPort === undefined} on:click={() => (powerDialog = !powerDialog)}
        >settings_power</button
      >
    </div>
    {#await ($serialPort, getViablePorts()) then ports}
      {#if connectDialog}
        <div
          class="backdrop"
          transition:fade={{duration: 250}}
          on:click={() => (connectDialog = !connectDialog)}
        />
        <dialog open transition:slide={{duration: 250}}>
          <label><input type="checkbox" use:preference={"autoConnect"} />Auto Connect</label>
          {#if $serialPort}
            <button
              on:click={() => {
                $serialPort.disconnect()
                $serialPort = undefined
              }}><span class="icon">usb_off</span>Disconnect</button
            >
          {:else}
            {#if ports.length > 0}
              <button on:click={() => initSerial()}><span class="icon">usb</span>Connect</button>
            {/if}
            <button on:click={() => initSerial(true)}><span class="icon">link</span>Pair Device</button>
          {/if}
          {#if $serialPort}
            <button
              on:click={() => {
                $serialPort.forget()
                $serialPort = undefined
              }}><span class="icon">link_off</span>Unpair Device</button
            >
          {/if}
        </dialog>
      {/if}
    {/await}
    {#if powerDialog}
      <div class="backdrop" transition:fade={{duration: 250}} on:click={() => (powerDialog = !powerDialog)} />
      <dialog open transition:slide={{duration: 250}}>
        <h3>Boot Menu</h3>
        <button><span class="icon">restart_alt</span>Reboot</button>
        <button><span class="icon">rule_settings</span>Bootloader</button>
      </dialog>
    {/if}
  {/if}
</section>

<style lang="scss">
  h2 {
    margin-block: 8px;
  }

  p {
    margin-block: 8px;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .backdrop {
    position: absolute;
    z-index: 1;
    inset: 0;

    background: #0005;
    border-radius: 40px;
  }

  dialog {
    position: relative;
    z-index: 2;

    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    width: 100%;
    margin: 0;
    margin-block-start: 16px;
    padding: 0;

    color: var(--md-sys-color-on-secondary-container);

    background: var(--md-sys-color-secondary-container);
    border: none;
    border-radius: 32px;
  }

  .row {
    display: flex;
    gap: 8px;
    height: fit-content;
  }

  dialog > * {
    margin-inline: 16px;
  }

  dialog > :first-child {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    margin: 0;
    padding-block: 8px;

    color: var(--md-sys-color-on-secondary);

    background: var(--md-sys-color-secondary);
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

    &.error {
      color: var(--md-sys-color-on-error);
      background: var(--md-sys-color-error);
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
