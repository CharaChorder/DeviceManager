<script lang="ts">
  import { serialPort } from "$lib/serial/connection";
  import { slide } from "svelte/transition";

  let { data } = $props();

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

<style lang="scss">
  ul {
    display: flex;
    gap: 8px;
    list-style: none;
  }

  li {
    margin: 0;
    padding: 0;
  }

  a {
    transition:
      background-color 200ms ease,
      color 200ms ease,
      outline-offset 200ms ease,
      outline-color 200ms ease;
    outline: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
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
    animation: wiggle 500ms ease 2 alternate;
    outline-color: var(--md-sys-color-primary);
    outline-width: 2px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }
</style>
