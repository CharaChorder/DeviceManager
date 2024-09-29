<script lang="ts">
  import { serialPort } from "$lib/serial/connection";
  import { slide } from "svelte/transition";

  let { data } = $props();

  let currentDevice = $derived(
    $serialPort
      ? `${$serialPort.device.toLowerCase()}_${$serialPort.chipset.toLowerCase()}`
      : undefined,
  );
  let isCorrectDevice = $derived(
    currentDevice ? currentDevice === data.device : undefined,
  );

  let uf2Url = $derived(
    data.uf2
      ? `${import.meta.env.VITE_FIRMWARE_URL}${data.device}/${data.version}/${data.uf2.name}`
      : undefined,
  );
  let otaUrl = $derived(
    data.ota
      ? `${import.meta.env.VITE_FIRMWARE_URL}${data.device}/${data.version}/${data.ota.name}`
      : undefined,
  );

  /**
   * Bytes to respective units
   */
  function toByteUnit(value: number) {
    if (value < 1024) {
      return `${value}B`;
    } else if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(2)}KB`;
    } else {
      return `${(value / 1024 / 1024).toFixed(2)}MB`;
    }
  }
</script>

<div>
  <h2>
    Update <em
      class="device"
      class:correct-device={isCorrectDevice === true}
      class:incorrect-device={isCorrectDevice === false}>{data.device}</em
    >
    to <em class="version">{data.version}</em>
  </h2>

  <ul class="files">
    {#if data.uf2}
      <li>
        <a target="_blank" download href={uf2Url}
          >{data.uf2.name} <span class="icon">download</span><span class="size"
            >{toByteUnit(data.uf2.size)}</span
          ></a
        >
      </li>
    {/if}
    {#if data.ota}
      <li>
        <a target="_blank" download href={otaUrl}
          >{data.ota.name} <span class="icon">download</span><span class="size"
            >{toByteUnit(data.uf2.size)}</span
          ></a
        >
      </li>
    {/if}
  </ul>

  {#if isCorrectDevice === false}
    <div transition:slide class="incorrect-device">
      These files are incompatible with your device
    </div>
  {/if}

  <section>
    <h3>OTA Upate</h3>
    {#if data.ota}
      <p>OTA update</p>
    {:else}
      <em>There are no OTA files for this device.</em>
    {/if}
  </section>

  <hr />

  <h3>Other options</h3>

  <section>
    <h4>Via UF2</h4>
    <ol>
      <li>Backup your device</li>
      <li>Reboot to bootloader</li>
      <li>Save CURRENT.UF2 to the new drive</li>
      <li>Restore</li>
    </ol>
  </section>
  <section>
    <h4>Via Serial</h4>
    <p>WIP</p>
  </section>
</div>

<style lang="scss">
  h2 > em {
    font-style: normal;
    transition: color 200ms ease;
  }

  hr {
    color: var(--md-sys-color-outline);
    margin-block: 3em;
    margin-inline: 5em;
    border-style: dashed;
  }

  .files {
    list-style: none;
    display: flex;
    padding: 0;
    gap: 8px;

    a {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: 1fr;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: 8px;
      font-size: 0.9em;
      height: auto;

      .size {
        font-size: 0.8em;
        opacity: 0.8;
      }

      .icon {
        padding-inline-start: 0.4em;
        grid-column: 2;
        grid-row: 1 / span 2;
      }
    }
  }

  .version {
    color: var(--md-sys-color-secondary);
  }

  .device {
    opacity: 0.6;
  }

  .correct-device {
    color: var(--md-sys-color-primary);
    opacity: 1;
  }

  .incorrect-device {
    color: var(--md-sys-color-error);
  }
</style>
