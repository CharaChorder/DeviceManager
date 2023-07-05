<script>
  import {serialPort} from "$lib/serial/connection.js"
  import Terminal from "$lib/components/Terminal.svelte"
</script>

<svelte:head>
  <title>dot i/o device manager</title>
</svelte:head>

<h1>Device Manager</h1>

<div class="device-grid">
  <section>
    <h2>Control</h2>
    <div class="icon bg">memory</div>
    <div class="row">
      <button disabled class="icon secondary" title="Save changes to device">rule_settings</button>
      <button disabled title="Reboot" class="icon">restart_alt</button>
      <button disabled>
        {#if $serialPort}
          <span class="icon">usb_off</span> Disconnect
        {:else}
          <span class="icon">usb</span> Connect
        {/if}
      </button>
    </div>
    {#if $serialPort}
      <pre>{#await $serialPort.version then version}{version}{/await}<br
        />{#await $serialPort.deviceId then id}{id}{/await}</pre>
    {/if}
  </section>

  <section>
    <h2>Layout</h2>
    <div class="icon bg">keyboard</div>
    <div class="row">
      <button class="icon" title="Import Layout">download</button>
      <button class="icon" title="Export Layout">upload</button>
    </div>
  </section>

  <section>
    <h2>Chords</h2>
    <div class="icon bg">piano</div>
    <table>
      <tr>
        <th>three</th>
        <td><i>␣</i><i>3</i></td>
      </tr>
    </table>
  </section>

  <section>
    <h2>Serial Terminal</h2>
    <div class="icon bg">terminal</div>
    <Terminal />
  </section>
</div>

<style lang="scss">
  section {
    position: relative;
    min-height: 128px;
    padding: 8px;
    border-radius: 32px;

    > h2 {
      font-size: 1.5rem;
    }

    > div.icon.bg {
      user-select: none;

      position: absolute;
      z-index: -1;
      top: -4px;
      left: -8px;

      font-size: 64px;

      opacity: 0.05;
    }
  }

  .row {
    display: flex;
    gap: 8px;
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

    &:hover:not(:disabled) {
      color: var(--md-sys-color-on-surface-variant);
      background: var(--md-sys-color-surface-variant);
    }
  }

  table td {
    display: flex;
    gap: 4px;
  }

  table i {
    display: block;

    aspect-ratio: 1;
    padding-block: 4px;
    padding-inline: 8px;

    font-style: normal;

    border: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
  }

  .device-grid {
    display: grid;
    grid-template-rows: 1fr 1fr;
  }
</style>
