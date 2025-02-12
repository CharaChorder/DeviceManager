<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { serialPort } from "$lib/serial/connection";
  import { expoOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let { children } = $props();

  const animationDuration = 400;
  const stagger = 80;

  let targetDevice = $derived($page.params["device"]);
  let version = $derived($page.params["version"]);

  let currentDevice = $derived(
    $serialPort
      ? `${$serialPort.device.toLowerCase()}_${$serialPort.chipset.toLowerCase()}`
      : undefined,
  );
  let isCorrectDevice = $derived(
    currentDevice ? currentDevice === targetDevice : undefined,
  );

  let fullBack = $state(false);

  beforeNavigate(({ from, to, cancel }) => {
    fullBack = version !== undefined;
  });
</script>

<h1>
  <a class="inline-link" href="/ccos">CCOS</a>
  {#if targetDevice !== undefined}
    <div
      class="uri-fragment"
      transition:slide={{
        axis: "x",
        duration: animationDuration,
        delay: fullBack ? stagger : 0,
        easing: expoOut,
      }}
    >
      <span class="separator">/</span>
      <a
        href="/ccos/{targetDevice}"
        class="device inline-link"
        class:correct-device={isCorrectDevice === true}
        class:incorrect-device={isCorrectDevice === false}>{targetDevice}</a
      >
    </div>
  {/if}
  {#if version !== undefined}
    <div
      class="uri-fragment"
      transition:slide={{
        axis: "x",
        duration: animationDuration,
        easing: expoOut,
      }}
    >
      <span class="separator">/</span>
      <em class="version">{version}</em>
    </div>
  {/if}
</h1>

{@render children()}

<style lang="scss">
  h1 {
    display: flex;
    margin-block: 1em;
    padding: 0;
    font-size: 2em;
  }

  .uri-fragment {
    display: flex;
  }

  .separator {
    margin-inline: 0.5em;
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
