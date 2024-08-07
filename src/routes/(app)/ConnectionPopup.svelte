<script lang="ts">
  import { initSerial, serialPort } from "$lib/serial/connection";
  import { browser } from "$app/environment";
  import { slide, fade } from "svelte/transition";
  import { preference } from "$lib/preferences";
  import LL from "$i18n/i18n-svelte";
  import { downloadBackup } from "$lib/backup/backup";

  function reboot() {
    $serialPort?.reboot();
    $serialPort = undefined;
    powerDialog = false;
    setTimeout(() => {
      initSerial();
    }, 1000);
  }

  function bootloader() {
    downloadBackup();
    $serialPort?.bootloader();
    $serialPort = undefined;
    rebootInfo = true;
    powerDialog = false;
  }

  async function connect() {
    try {
      await initSerial(true);
    } catch (error) {
      console.error(error);
      alert(
        "Connection failed. Is your device maybe pre-CCOS? Refer to the doc link in the bottom left for more information on your device.",
      );
    }
  }

  let rebootInfo = $derived($serialPort !== undefined);
  let terminal = $state(false);
  let powerDialog = $state(false);
</script>

<section>
  <div class="row">
    <h2>{$LL.deviceManager.TITLE()}</h2>
    <label
      >{$LL.deviceManager.AUTO_CONNECT()}<input
        type="checkbox"
        use:preference={"autoConnect"}
      /></label
    >
  </div>

  {#if $serialPort}
    <p transition:slide>
      {$serialPort.company}
      {$serialPort.device}
      {$serialPort.chipset}
      <br />
      Version {$serialPort.version}
    </p>
    {#if $serialPort.version.toString() !== import.meta.env.VITE_LATEST_FIRMWARE}
      <a
        href="https://docs.charachorder.com/CharaChorder%20One.html#updating-the-firmware"
        >Firmware Update Instructions</a
      >
    {/if}
    <!--<button on:click={updateFirmware}>Update</button>-->
  {/if}

  {#if browser}
    {#if navigator.userAgent.includes("Linux") && !$serialPort}
      <div class="linux-info">
        <p>{@html $LL.deviceManager.LINUX_PERMISSIONS()}</p>
        <p>
          In most cases you can simply follow the <a
            target="_blank"
            href="https://docs.arduino.cc/software/ide-v1/tutorials/Linux#please-read"
            >Arduino Guide</a
          > on serial port permissions.
        </p>
        <p>Special systems:</p>
        <ul>
          <li>
            <a
              target="_blank"
              href="https://wiki.archlinux.org/title/Arduino#Accessing_serial"
              >Arch and Arch-based like Manjaro or EndeavourOS</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://gist.github.com/CMCDragonkai/d00201ec143c9f749fc49533034e5009?permalink_comment_id=4670311#gistcomment-4670311"
              >NixOS</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://wiki.gentoo.org/wiki/Arduino#Grant_access_to_non-root_users"
              >Gentoo</a
            >
          </li>
        </ul>
      </div>
    {/if}
    {#if rebootInfo}
      <p transition:slide>
        <b>{$LL.deviceManager.bootMenu.POWER_WARNING()}</b>
      </p>
    {/if}
    <div class="row">
      {#if $serialPort}
        <button
          class="secondary"
          onclick={() => {
            $serialPort?.forget();
            $serialPort = undefined;
          }}
          ><span class="icon">usb_off</span
          >{$LL.deviceManager.DISCONNECT()}</button
        >
      {:else}
        <button class="error" onclick={connect}
          ><span class="icon">usb</span>{$LL.deviceManager.CONNECT()}</button
        >
      {/if}
      <div class="row" style="justify-content: flex-end">
        <a
          href="/terminal"
          title={$LL.deviceManager.TERMINAL()}
          class="icon"
          class:disabled={$serialPort === undefined}
          onclick={() => (terminal = !terminal)}>terminal</a
        >
        <button
          class="icon"
          title={$LL.deviceManager.bootMenu.TITLE()}
          disabled={$serialPort === undefined}
          onclick={() => (powerDialog = !powerDialog)}>settings_power</button
        >
      </div>
    </div>
    {#if powerDialog}
      <div
        class="backdrop"
        role="button"
        tabindex="-1"
        transition:fade={{ duration: 250 }}
        onclick={() => (powerDialog = !powerDialog)}
        onkeypress={(event) => {
          if (event.key === "Enter") powerDialog = !powerDialog;
        }}
      ></div>
      <dialog open transition:slide={{ duration: 250 }}>
        <h3>{$LL.deviceManager.bootMenu.TITLE()}</h3>
        <button onclick={reboot}
          ><span class="icon">restart_alt</span
          >{$LL.deviceManager.bootMenu.REBOOT()}</button
        >
        <button onclick={bootloader}
          ><span class="icon">rule_settings</span
          >{$LL.deviceManager.bootMenu.BOOTLOADER()}</button
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

  .linux-info a {
    display: inline;
    padding-inline: 0;
    text-decoration: underline;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    width: 300px;
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

  button:active:not(:disabled) {
    color: var(--md-sys-color-on-surface-variant);
    background: var(--md-sys-color-surface-variant);
  }
</style>
