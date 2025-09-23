<script lang="ts">
  import { downloadBackup } from "$lib/backup/backup";
  import { initSerial, serialPort } from "$lib/serial/connection";
  import { fade, slide } from "svelte/transition";
  import { lt as semverLt } from "semver";
  import type { LoaderOptions, ESPLoader } from "esptool-js";

  let { data } = $props();

  let working = $state(false);
  let success = $state(false);
  let error = $state<Error | undefined>(undefined);

  let isTooOld = $derived(
    $serialPort ? semverLt($serialPort.version, "2.0.0") : false,
  );

  let unsafeUpdate = $state(false);

  let terminalOutput = $state("");
  let progress = $state(0);

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
        `${data.meta.path}/${data.meta.update.ota}`,
      ).then((it) => it.arrayBuffer());

      await port.updateFirmware(file, (transferred, total) => {
        progress = transferred / total;
      });

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
    currentDevice ? currentDevice === data.meta.device : undefined,
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
    const uf2Promise = fetch(`${data.meta.path}/${data.meta.update.uf2}`).then(
      (it) => it.blob(),
    );
    const handle = await window.showSaveFilePicker({
      id: `${data.meta.device}-update`,
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
      const spiFlash = data.meta.spiFlash!;
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
  {#if data.meta.update.ota && !data.meta.device.endsWith("m0")}
    {@const buttonError = error || (!success && isCorrectDevice === false)}
    <section>
      <button
        class="update-button"
        class:working={working && (progress <= 0 || progress >= 1)}
        class:progress={working && progress > 0 && progress < 1}
        style:--progress="{progress * 100}%"
        class:primary={!buttonError}
        class:error={buttonError}
        disabled={isTooOld ||
          working ||
          $serialPort === undefined ||
          !isCorrectDevice}
        onclick={update}>Apply Update</button
      >
      {#if isTooOld}
        <div class="error" transition:slide>
          Your device's firmware is too old to be updated via OTA. Follow the
          instruction below to update it manually.
        </div>
      {:else if $serialPort && isCorrectDevice}
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

    {#if !isTooOld}
      <label class="unsafe-opt-in"
        ><input type="checkbox" /> Unsafe recovery options</label
      >
    {/if}
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

    {#if false && data.meta.update.esptool}
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

  <section class="changelog">
    <h2>Changelog</h2>
    {#if data.meta.changelog.features}
      <h3>Features</h3>
      <ul>
        {#each data.meta.changelog.features as feature}
          <li>
            <b>{@html feature.summary}</b>
            {@html feature.description}
          </li>
        {/each}
      </ul>
    {/if}
    {#if data.meta.changelog.fixes}
      <h3>Fixes</h3>
      <ul>
        {#each data.meta.changelog.fixes as fix}
          <li>
            <b>{@html fix.summary}</b>
            {@html fix.description}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style lang="scss">
  .changelog:empty {
    display: none;
  }

  .changelog ul {
    padding-inline-start: 0em;
    list-style: none;
  }

  .changelog li {
    margin-block: 0.2em;
    padding: 0.5em 1em;
  }

  .changelog b {
    display: inline-block;
    translate: -0.5em -0.2em;
    border-radius: 8px;
    background: var(--md-sys-color-tertiary-container);
    padding: 0.2em 0.5em;
    color: var(--md-sys-color-on-tertiary-container);
  }

  pre {
    overflow: auto;
  }

  .unsafe-opt-in {
    opacity: 0.6;
    margin-block: 1em;
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
    margin: 0;
    padding: 0;
    height: unset;
    color: var(--md-sys-color-primary);
    font-size: inherit;

    .icon {
      translate: 0 0.1em;
      padding-inline-end: 0.2em;
      font-size: 1.2em;
    }
  }

  .icon.ok {
    translate: 0 0.1em;
    font-size: 1.2em;
    --icon-fill: 1;
  }

  .faded {
    opacity: 0.8;
  }

  button.update-button {
    position: relative;
    transition:
      border 200ms ease,
      color 200ms ease;

    margin: 6px;
    margin-block: 16px;

    outline: 2px dashed currentcolor;
    outline-offset: 4px;

    border: 2px solid currentcolor;
    border-radius: 8px;

    background: var(--md-sys-color-background);
    height: 42px;
    overflow: hidden;

    &.primary {
      background: none;
      color: var(--md-sys-color-primary);
    }

    &.progress,
    &.working {
      border-color: transparent;
    }

    &.working::before {
      position: absolute;
      z-index: -1;
      border-radius: 8px;
      background: var(--md-sys-color-background);
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      content: "";
    }

    &.working::after {
      position: absolute;
      z-index: -2;
      animation: rotate 1s ease-out forwards infinite;
      background: var(--md-sys-color-primary);
      width: 120%;
      height: 30%;
      content: "";
    }

    &.progress::after {
      position: absolute;
      left: 0;
      opacity: 0.2;
      z-index: -2;
      background: var(--md-sys-color-primary);
      width: var(--progress);
      height: 100%;
      content: "";
    }
  }

  .version {
    color: var(--md-sys-color-secondary);
  }

  .incorrect-device {
    color: var(--md-sys-color-error);
  }

  .esp-buttons {
    display: flex;
  }
</style>
