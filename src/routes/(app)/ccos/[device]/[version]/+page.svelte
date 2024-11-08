<script lang="ts">
  import { downloadBackup } from "$lib/backup/backup";
  import { initSerial, serialPort } from "$lib/serial/connection";
  import { fade, slide } from "svelte/transition";

  let { data } = $props();

  let working = $state(false);
  let success = $state(false);
  let error = $state<Error | undefined>(undefined);

  let step = $state(0);

  async function update() {
    working = true;
    error = undefined;
    success = false;
    const port = $serialPort!;
    $serialPort = undefined;
    try {
      const file = await fetch(otaUrl!).then((it) => it.blob());

      await port.updateFirmware(file);

      success = true;
    } catch (e) {
      error = e as Error;
    } finally {
      working = false;
    }
  }

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

  async function connect() {
    try {
      await initSerial(true, false);
      step = 1;
    } catch (e) {
      error = e as Error;
    }
  }

  function backup() {
    downloadBackup();
    step = 2;
  }

  function bootloader() {
    $serialPort?.bootloader();
    $serialPort = undefined;
    step = 3;
  }

  async function getFileSystem() {
    if (!uf2Url) return;
    const uf2Promise = fetch(uf2Url).then((it) => it.blob());
    const handle = await window.showSaveFilePicker({
      id: `${data.device}-update`,
      suggestedName: "CURRENT.UF2",
      excludeAcceptAllOption: true,
      types: [
        {
          description: "UF2 Firmware",
          accept: { "application/octet-stream": [".UF2"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    const uf2 = await uf2Promise;
    await uf2.stream().pipeTo(writable);
    step = 4;
  }
</script>

<div class="container">
  <h2>
    <a class="inline-link" href="/ccos">CCOS</a> /
    <a
      href="/ccos/{data.device}"
      class="device inline-link"
      class:correct-device={isCorrectDevice === true}
      class:incorrect-device={isCorrectDevice === false}>{data.device}</a
    >
    / <em class="version">{data.version}</em>
  </h2>

  {#if data.ota && !data.device.endsWith("m0")}
    {@const buttonError = error || (!success && isCorrectDevice === false)}
    <section>
      <button
        class="update-button"
        class:working
        class:primary={!buttonError}
        class:error={buttonError}
        disabled={working || $serialPort === undefined || !isCorrectDevice}
        onclick={update}>Apply Update</button
      >
      {#if $serialPort && isCorrectDevice}
        <div transition:slide>
          Your
          <b
            >{$serialPort.company}
            {$serialPort.device}
            {$serialPort.chipset}</b
          >
          will be updated from <b class="version">{$serialPort.version}</b> to
          <b class="version">{data.version}</b>
        </div>
      {:else if $serialPort && isCorrectDevice === false}
        <div class="error" transition:slide>
          Your device is incompatible with the selected update.
        </div>
      {:else if success}
        <div class="primary" transition:slide>Update successful</div>
      {:else if error}
        <div class="error" transition:slide>{error.message}</div>
      {:else if working}
        <div class="primary" transition:slide>Updating your device...</div>
      {:else}
        <div class="primary" transition:slide>
          Connect your device to continue
        </div>
      {/if}
    </section>

    <h3>Manual Update</h3>
  {/if}

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
    <h4>UF2 Instructions</h4>
    <ol>
      <li>
        <button class="inline-button" onclick={connect}
          ><span class="icon">usb</span>Connect</button
        >
        your device
        {#if step >= 1}
          <span class="icon ok" transition:fade>check_circle</span>
        {/if}
      </li>

      <li class:faded={step < 1}>
        Make a <button class="inline-button" onclick={backup}
          ><span class="icon">download</span>Backup</button
        >
        {#if step >= 2}
          <span class="icon ok" transition:fade>check_circle</span>
        {/if}
      </li>

      <li class:faded={step < 2}>
        Reboot to <button class="inline-button" onclick={bootloader}
          ><span class="icon">restart_alt</span>Bootloader</button
        >
        {#if step >= 3}
          <span class="icon ok" transition:fade>check_circle</span>
        {/if}
      </li>

      <li class:faded={step < 3}>
        Replace <button class="inline-button" onclick={getFileSystem}
          ><span class="icon">deployed_code_update</span>CURRENT.UF2</button
        >
        on the new drive
        {#if step >= 4}
          <span class="icon ok" transition:fade>check_circle</span>
        {/if}
      </li>
    </ol>
  </section>
</div>

<style lang="scss">
  h2 > em {
    font-style: normal;
    transition: color 200ms ease;
  }

  h3 {
    margin-block-start: 4em;
  }

  .primary {
    color: var(--md-sys-color-primary);
  }

  .error {
    color: var(--md-sys-color-error);
  }

  .container {
    width: calc(min(100%, 16cm));
  }

  @keyframes rotate {
    0% {
      transform: rotate(120deg);
      opacity: 0;
    }

    20% {
      transform: rotate(120deg);
      opacity: 0;
    }

    60% {
      opacity: 1;
    }

    100% {
      transform: rotate(270deg);
      opacity: 0;
    }
  }

  button.inline-button {
    display: inline;
    padding: 0;
    margin: 0;
    height: unset;
    font-size: inherit;
    color: var(--md-sys-color-primary);

    .icon {
      font-size: 1.2em;
      translate: 0 0.1em;
      padding-inline-end: 0.2em;
    }
  }

  .icon.ok {
    font-size: 1.2em;
    translate: 0 0.1em;
    --icon-fill: 1;
  }

  .faded {
    opacity: 0.8;
  }

  button.update-button {
    overflow: hidden;
    position: relative;
    height: 42px;

    border: 2px solid currentcolor;
    border-radius: 8px;

    outline: 2px dashed currentcolor;
    outline-offset: 4px;

    background: var(--md-sys-color-background);
    transition:
      border 200ms ease,
      color 200ms ease;

    margin: 6px;
    margin-block: 16px;

    &.primary {
      color: var(--md-sys-color-primary);
      background: none;
    }

    &.working {
      border-color: transparent;
    }

    &.working::before {
      z-index: -1;
      position: absolute;
      background: var(--md-sys-color-background);
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      border-radius: 8px;
      content: "";
    }

    &.working::after {
      z-index: -2;
      position: absolute;
      content: "";
      background: var(--md-sys-color-primary);
      animation: rotate 1s ease-out forwards infinite;
      height: 30%;
      width: 120%;
    }
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
  }

  a[download] {
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

  .version {
    color: var(--md-sys-color-secondary);
  }

  .device {
    opacity: 0.6;
  }

  .inline-link {
    display: inline;
    padding: 0;
  }

  .correct-device {
    color: var(--md-sys-color-primary);
    opacity: 1;
  }

  .incorrect-device {
    color: var(--md-sys-color-error);
  }
</style>
