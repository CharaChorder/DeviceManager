<script lang="ts">
  import LL from "$i18n/i18n-svelte";
  import { preference } from "$lib/preferences";
  import { initSerial } from "$lib/serial/connection";
  import {
    getPortName,
    PORT_FILTERS,
    type SerialPortLike,
  } from "$lib/serial/device";
  import { showConnectionFailedDialog } from "$lib/dialogs/connection-failed-dialog";
  import { onMount } from "svelte";

  let ports = $state<SerialPort[]>([]);

  onMount(() => {
    refreshPorts();
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
</script>

<div class="device-list">
  <fieldset>
    <label
      ><input type="checkbox" use:preference={"autoConnect"} />
      <div class="title">{$LL.deviceManager.AUTO_CONNECT()}</div>
    </label>

    <label
      ><input type="checkbox" use:preference={"backup"} />
      <div class="title">{@html $LL.backup.AUTO_BACKUP()}</div>
    </label>
  </fieldset>
  <button
    onclick={async (event) => {
  const { fetchCCOS } = await import("$lib/ccos/ccos");
      const ccos = await fetchCCOS();
      if (ccos) {
        connect(ccos, !event.shiftKey);
      }
    }}
  >
    <span class="icon">history</span>
    CC0</button
  >
  {#each ports as port}
    <div class="device">
      <button
        onclick={(event) => {
          connect(port, !event.shiftKey);
        }}
      >
        <span class="icon">history</span>
        {getPortName(port)}</button
      >
      <button
        class="error"
        onclick={() => {
          port.forget();
          refreshPorts();
        }}><span class="icon">link_off</span></button
      >
    </div>
  {/each}
  <div class="pair">
    <button
      onclick={async (event) => {
        const port = await navigator.serial.requestPort({
          filters: event.shiftKey ? [] : [...PORT_FILTERS.values()],
        });
        if (!port) return;
        refreshPorts();
        connect(port, true);
      }}
      class="primary"><span class="icon">add</span>Pair</button
    >
    <a href="/ccos/zero_wasm/"><span class="icon">add</span>Virtual Device</a>
  </div>
</div>

<style lang="scss">
  button,
  a {
    padding: 10px;
    height: 32px;
    font-size: 12px;

    .icon {
      font-size: 18px;
    }
  }

  .pair {
    display: flex;
  }

  .device {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    button {
      flex: 1;
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

    .title {
      font-weight: 600;
    }
  }

  fieldset {
    display: flex;
    gap: 16px;
    border: none;
    padding: 0;
  }
</style>
