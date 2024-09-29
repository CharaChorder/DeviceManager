<script lang="ts">
  import { serialPort } from "$lib/serial/connection";
  import { slide } from "svelte/transition";

  let { data } = $props();

  let files: FileList | null = $state(null);

  $effect(() => {
    const file = files?.[0];
    if (file && $serialPort) {
      $serialPort.updateFirmware(file);
    }
  });

  let currentDevice = $derived(
    $serialPort
      ? `${$serialPort.device.toLowerCase()}_${$serialPort.chipset.toLowerCase()}`
      : undefined,
  );
</script>

<ul>
  {#each data.devices as device}
    <li>
      <a href="./{device.name}/" class:highlight={device.name === currentDevice}
        >{device.name}</a
      >
    </li>
  {/each}
</ul>

{#if !currentDevice}
  <aside transition:slide>Connect your device to see which one you need</aside>
{/if}

<input type="file" accept=".bin" bind:files />

<style lang="scss">
  ul {
    display: flex;
    list-style: none;
    gap: 8px;
  }

  li {
    margin: 0;
    padding: 0;
  }

  a {
    outline: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
    transition:
      background-color 200ms ease,
      color 200ms ease,
      outline-offset 200ms ease,
      outline-color 200ms ease;
  }

  @keyframes highlight {
    0% {
      outline-offset: 0;
    }
    100% {
      outline-offset: 4px;
    }
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
      scale: 1;
    }
    50% {
      transform: rotate(-5deg);
    }
    100% {
      transform: rotate(-5deg);
      scale: 1.1;
    }
  }

  .highlight {
    outline-width: 2px;
    outline-color: var(--md-sys-color-primary);
    animation: wiggle 500ms ease 2 alternate;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }
</style>
