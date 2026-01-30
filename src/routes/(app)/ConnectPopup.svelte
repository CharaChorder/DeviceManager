<script lang="ts">
  import LL from "$i18n/i18n-svelte";
  import { preference, userPreferences } from "$lib/preferences";
  import { initSerial } from "$lib/serial/connection";
  import {
    getPortName,
    PORT_FILTERS,
    type SerialPortLike,
  } from "$lib/serial/device";
  import { showConnectionFailedDialog } from "$lib/dialogs/connection-failed-dialog";
  import { onMount } from "svelte";
  import { persistentWritable } from "$lib/storage";
  import { goto } from "$app/navigation";

  let ports = $state<SerialPort[]>([]);
  let element: HTMLDivElement | undefined = $state();

  onMount(() => {
    refreshPorts();
  });

  let hasDiscoveredAutoConnect = persistentWritable(
    "hasDiscoveredAutoConnect",
    false,
  );

  $effect(() => {
    if ($userPreferences.backup || $userPreferences.autoConnect) {
      $hasDiscoveredAutoConnect = true;
    }
  });

  async function refreshPorts() {
    ports = await navigator.serial.getPorts();
  }

  async function connect(port: SerialPortLike, withSync: boolean) {
    try {
      await initSerial(port, withSync);
    } catch (error) {
      console.error(error);
      await showConnectionFailedDialog(String(error));
    }
  }

  function closePopover() {
    element?.closest<HTMLElement>("[popover]")?.hidePopover();
  }

  async function connectDevice(event: MouseEvent) {
    if (event.altKey) {
      goto("/terminal/");
      return;
    }
    const port = await navigator.serial.requestPort({
      filters: event.shiftKey ? [] : [...PORT_FILTERS.values()],
    });
    if (!port) return;
    closePopover();
    refreshPorts();
    connect(port, true);
  }
</script>

<div
  bind:this={element}
  class="device-list"
  onmouseenter={() => refreshPorts()}
  role="region"
>
  {#if ports.length === 1}
    <fieldset class:promote={!$hasDiscoveredAutoConnect}>
      <label
        ><input type="checkbox" use:preference={"autoConnect"} />
        <div class="title">{$LL.deviceManager.AUTO_CONNECT()}</div>
      </label>

      <label
        ><input type="checkbox" use:preference={"backup"} />
        <div class="title">{@html $LL.backup.AUTO_BACKUP()}</div>
      </label>
    </fieldset>
  {/if}
  {#if ports.length !== 0}
    <h4>Recent Devices</h4>
    <div class="devices">
      <!--
      <div class="device">
        <button onclick={connectCC0}> CC0</button>
      </div>-->
      {#each ports as port}
        <div class="device">
          <button
            onclick={(event) => {
              connect(port, !event.shiftKey);
            }}
          >
            {getPortName(port)}</button
          >
          <button
            class="error"
            onclick={() => {
              port.forget();
              refreshPorts();
            }}><span class="icon">visibility_off</span> Hide</button
          >
        </div>
      {/each}
    </div>
  {/if}
  <div class="pair">
    <button onclick={connectDevice} class="primary"
      ><span class="icon">add</span>Connect</button
    >
    <!--<a href="/ccos/zero_wasm/"><span class="icon">add</span>Virtual Device</a>-->
  </div>
</div>

<style lang="scss">
  button,
  a {
    padding: 10px;
    padding-inline-end: 16px;
    height: 38px;
    font-size: 12px;

    .icon {
      font-size: 18px;
    }
  }

  h4 {
    margin-block-start: 16px;
    margin-block-end: 8px;
    font-weight: 600;
  }

  .device-list {
    margin: 8px;
  }

  .pair {
    display: flex;
  }

  .devices {
    margin-bottom: 16px;
  }

  .device {
    display: flex;
    align-items: center;
    gap: 8px;

    button {
      flex: 1;
      justify-content: flex-start;
      font-size: 14px;
    }
  }

  button.error {
    color: var(--md-sys-color-error);
  }

  label {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    appearance: none;
    padding: 0;
    height: auto;
    overflow: hidden;

    .title {
      font-weight: 600;
    }
  }

  @keyframes attention {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(0.6);
    }
  }

  @keyframes swoosh {
    0% {
      transform: translateX(-200%) skewX(-20deg);
      opacity: 0;
    }

    50% {
      opacity: 1;
    }

    100% {
      transform: translateX(200%) skewX(-20deg);
      opacity: 0;
    }
  }

  .promote {
    label:not(:has(input:checked)) {
      animation: attention 1s ease;

      &::after {
        position: absolute;
        z-index: -1;
        animation: swoosh 1s ease forwards;
        background-color: var(--md-sys-color-surface-variant);
        width: 25%;
        height: 200%;
        content: "";
      }
    }
  }

  fieldset {
    display: flex;
    gap: 16px;
    border: none;
    padding: 0;
  }
</style>
