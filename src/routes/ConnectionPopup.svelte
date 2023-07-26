<script lang="ts">
  import {initSerial, serialPort} from "$lib/serial/connection"
  import {browser} from "$app/environment"
  import {slide, fade} from "svelte/transition"
  import {preference} from "$lib/preferences"
  import LL from "../i18n/i18n-svelte"

  let terminal = false
  let powerDialog = false
</script>

<section>
  <div class="row">
    <h2>{$LL.deviceManager.TITLE()}</h2>
    <label>{$LL.deviceManager.AUTO_CONNECT()}<input type="checkbox" use:preference={"autoConnect"} /></label>
  </div>

  {#if $serialPort}
    <p transition:slide>
      {$serialPort.company}
      {$serialPort.device}
      {$serialPort.chipset}
      <br />
      Version {$serialPort.version.map(it => it.toString()).join(".")}
    </p>
  {/if}

  {#if browser}
    <div class="row">
      {#if $serialPort}
        <button
          class="secondary"
          on:click={() => {
            $serialPort.forget()
            $serialPort = undefined
          }}><span class="icon">usb_off</span>{$LL.deviceManager.DISCONNECT()}</button
        >
      {:else}
        <button class="error" on:click={() => initSerial(true)}
          ><span class="icon">usb</span>{$LL.deviceManager.CONNECT()}</button
        >
      {/if}
      <div class="row" style="justify-content: flex-end">
        <a
          href="/terminal"
          title={$LL.deviceManager.TERMINAL()}
          class="icon"
          disabled={$serialPort === undefined}
          on:click={() => (terminal = !terminal)}>terminal</a
        >
        <button
          class="icon"
          title={$LL.deviceManager.bootMenu.TITLE()}
          disabled={$serialPort === undefined}
          on:click={() => (powerDialog = !powerDialog)}>settings_power</button
        >
      </div>
    </div>
    {#if powerDialog}
      <div class="backdrop" transition:fade={{duration: 250}} on:click={() => (powerDialog = !powerDialog)} />
      <dialog open transition:slide={{duration: 250}}>
        <h3>{$LL.deviceManager.bootMenu.TITLE()}</h3>
        <button
          on:click={() => {
            $serialPort.reboot()
            $serialPort = undefined
          }}><span class="icon">restart_alt</span>{$LL.deviceManager.bootMenu.REBOOT()}</button
        >
        <button
          on:click={() => {
            $serialPort.bootloader()
            $serialPort = undefined
          }}><span class="icon">rule_settings</span>{$LL.deviceManager.bootMenu.BOOTLOADER()}</button
        >
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

    min-width: 260px;
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
    gap: 0;
    justify-content: space-between;

    width: 100%;
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

  a,
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
    text-decoration: none;

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
</style>
