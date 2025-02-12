<script lang="ts">
  import { downloadBackup } from "$lib/backup/backup";
  import { initSerial, serialPort } from "$lib/serial/connection";
  import { fade, slide } from "svelte/transition";
  import type { LoaderOptions, ESPLoader } from "esptool-js";

  let { data } = $props();

  let working = $state(false);
  let success = $state(false);
  let error = $state<Error | undefined>(undefined);

  let unsafeUpdate = $state(false);

  let terminalOutput = $state("");

  let step = $state(0);
  let eraseAll = $state(false);

  let espLoader;

  async function update() {
    working = true;
    error = undefined;
    success = false;
    const port = $serialPort!;
    $serialPort = undefined;
    try {
      const file = await fetch(
        `${data.meta.path}/${data.meta.update.ota?.name}`,
      ).then((it) => it.blob());

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
    currentDevice ? currentDevice === data.meta.target : undefined,
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
    if (!data.meta.update.uf2) return;
    const uf2Promise = fetch(
      `${data.meta.path}/${data.meta.update.uf2.name}`,
    ).then((it) => it.blob());
    const handle = await window.showSaveFilePicker({
      id: `${data.meta.target}-update`,
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

  async function espBootloader() {
    $serialPort?.forget();
    const port = await navigator.serial.requestPort();
    port.open({ baudRate: 1200 });
  }

  async function connectEsp(port: SerialPort): Promise<ESPLoader> {
    const esptool = data.meta.update.esptool!;
    const { Transport, ESPLoader } = await import("esptool-js");
    const espLoader = new ESPLoader({
      transport: new Transport(port),
      baudrate: 9600, // Number(esptool.baud),
      romBaudrate: 9600, // Number(esptool.baud),
      debugLogging: true,
      terminal: {
        clean: () => {
          terminalOutput = "";
        },
        writeLine: (data) => {
          terminalOutput += data + "\n";
        },
        write: (data) => {
          terminalOutput += data;
        },
      },
    } satisfies LoaderOptions);
    await espLoader.detectChip(esptool.before);
    if (!espLoader.IS_STUB) {
      await espLoader.runStub();
    }

    return espLoader;
  }

  async function flashImages() {
    const port = await navigator.serial.requestPort();
    try {
      const esptool = data.meta.update.esptool!;
      espLoader = await connectEsp(port);
      const fileArray = await Promise.all(
        Object.entries(esptool.files).map(([offset, name]) =>
          fetch(`${data.meta.path}/${name}`)
            .then((it) => it.blob())
            .then((it) => it.text())
            .then((it) => ({
              address: Number(offset),
              data: it,
            })),
        ),
      );

      await espLoader.writeFlash({
        flashSize: esptool.flash_size,
        flashMode: esptool.flash_mode,
        flashFreq: esptool.flash_freq,
        compress: true,
        eraseAll,
        fileArray,
      });
    } finally {
      port.close();
    }
  }

  async function eraseSPI() {
    const port = await navigator.serial.requestPort();
    try {
      console.log(data.meta);
      const spiFlash = data.meta.spi_flash!;
      espLoader = await connectEsp(port);

      /*espLoader.flashSpiAttach(
        (spiFlash.connection.clk << 0) |
          (spiFlash.connection.q << 8) |
          (spiFlash.connection.d << 16) |
          (spiFlash.connection.cs << 24),
      );
      espLoader.flashId();*/
    } finally {
      port.close();
    }
  }
</script>

<div class="container">
  {#if data.meta.update.ota && !data.meta.target.endsWith("m0")}
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
          <b class="version">{data.meta.version}</b>
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

    <label class="unsafe-opt-in"
      ><input type="checkbox" /> Unsafe recovery options</label
    >
  {/if}

  <div class="unsafe-updates">
    {#if isCorrectDevice === false}
      <div transition:slide class="incorrect-device">
        These files are incompatible with your device
      </div>
    {/if}

    <section>
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

    {#if data.meta.update.esptool}
      <section>
        <h3>Factory Flash (WIP)</h3>
        <p>
          If everything else fails, you can go through the same process that is
          being used in the factory.
        </p>
        <p>
          This will temporarily brick your device if the process is not done
          completely or incorrectly.
        </p>

        <div class="esp-buttons">
          <button onclick={espBootloader}
            ><span class="icon">memory</span>ESP Bootloader</button
          >
          <button onclick={flashImages}
            ><span class="icon">developer_board</span>Flash Images</button
          >
          <label
            ><input type="checkbox" id="erase" bind:checked={eraseAll} />Erase
            All</label
          >
          <button onclick={eraseSPI}
            ><span class="icon">developer_board</span>Erase SPI Flash</button
          >
        </div>

        <pre>{terminalOutput}</pre>
      </section>
    {/if}
  </div>
</div>

<style lang="scss">
  h2 > em {
    font-style: normal;
    transition: color 200ms ease;
  }

  h3 {
    margin-block-start: 4em;
  }

  pre {
    overflow: auto;
  }

  .unsafe-opt-in {
    margin-block: 1em;
    opacity: 0.6;
    font-size: 0.7em;

    & + .unsafe-updates {
      display: none;
    }

    &:has(input:checked) + .unsafe-updates {
      display: block;
    }
  }

  .primary {
    color: var(--md-sys-color-primary);
  }

  .error {
    color: var(--md-sys-color-error);
  }

  .container {
    width: calc(min(100%, 16cm));
    overflow: auto;
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

  .esp-buttons {
    display: flex;
  }
</style>
