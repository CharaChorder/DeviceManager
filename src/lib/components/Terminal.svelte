<script lang="ts">
  import { serialLog, serialPort } from "$lib/serial/connection";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  onMount(() => {
    io.scrollTo({ top: io.scrollHeight });
  });

  function submit(event: Event) {
    event.preventDefault();
    $serialPort?.send(0, [value.trim()]);
    value = "";
    io.scrollTo({ top: io.scrollHeight });
  }

  let value: string = $state("");
  let io: HTMLDivElement;
</script>

<form onsubmit={submit}>
  <div bind:this={io} class="io">
    {#each $serialLog as { type, value }}
      {#if type === "input"}
        <code transition:slide>{value}</code>
      {:else if type === "output"}
        <samp transition:slide>{value}</samp>
      {:else}
        <p transition:slide>{value}</p>
      {/if}
    {/each}
    <div class="anchor"></div>
  </div>
  <fieldset>
    <input onsubmit={submit} bind:value />
  </fieldset>
</form>

<style lang="scss">
  form {
    display: flex;
    position: relative;
    flex-direction: column;

    contain: strict;

    border-radius: 16px;

    width: 100%;
    height: 100%;
    overflow: hidden;
    color: var(--md-sys-color-on-secondary);
    font-size: 0.75rem;

    font-family: "Noto Sans Mono", monospace;
  }

  fieldset::before {
    position: absolute;
    bottom: 8px;
    left: 8px;
    content: "$";

    font-weight: 900;
  }

  input {
    appearance: none;
    margin-block-start: -16px;
    border: none;
    background: var(--md-sys-color-secondary);
    padding: 8px;
    padding-inline-start: calc(8px + 1.5ch);
    padding-block-start: 24px;
    width: 100%;
    color: var(--md-sys-color-on-secondary);
    font-weight: 600;

    font-family: "Noto Sans Mono", monospace;
  }

  .io {
    --scrollbar-color: var(--md-sys-color-secondary);
    flex: 1;

    z-index: 1;
    border-radius: 0 0 16px 16px;

    background: var(--md-sys-color-secondary-container);

    padding: 12px;

    overflow-y: auto;

    color: var(--md-sys-color-on-secondary-container);
  }

  :focus-visible {
    outline: none;
  }

  fieldset {
    all: unset;

    display: block;

    position: relative;

    opacity: 0.8;

    transition: opacity 250ms ease;

    &:focus-within {
      opacity: 1;
    }
  }

  .anchor {
    height: 1px;
    overflow-anchor: auto;
  }

  code,
  samp,
  p {
    display: block;
    margin-block: 0.15rem;
    overflow-anchor: none;
  }

  p {
    display: flex;
    justify-content: center;

    margin-block-end: 1rem;
    border-radius: 8px;

    background: var(--md-sys-color-secondary);
    padding: 0.25rem;

    color: var(--md-sys-color-on-secondary);
  }

  code::before {
    margin-block-end: 0.25rem;
    content: "> ";
    color: var(--md-sys-color-primary);
    font-weight: 900;
  }

  ::selection {
    background: var(--md-sys-color-on-background);
    color: var(--md-sys-color-background);
  }

  @keyframes blink {
    100%,
    60% {
      opacity: 1;
    }

    40%,
    0% {
      opacity: 0;
    }
  }
</style>
