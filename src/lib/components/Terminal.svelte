<script lang="ts">
  import { serialLog, serialPort } from "$lib/serial/connection";
  import { slide } from "svelte/transition";

  function submit(event: Event) {
    event.preventDefault();
    $serialPort.send(value.trim());
    value = "";
    io.scrollTo({ top: io.scrollHeight });
  }

  let value: string;
  let io: HTMLDivElement;
</script>

<form on:submit={submit}>
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
    <div class="anchor" />
  </div>
  <fieldset>
    <input on:submit={submit} bind:value />
  </fieldset>
</form>

<style lang="scss">
  form {
    position: relative;

    contain: strict;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;

    font-family: "Noto Sans Mono", monospace;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-secondary);

    border-radius: 16px;
  }

  fieldset::before {
    content: "$";

    position: absolute;
    bottom: 8px;
    left: 8px;

    font-weight: 900;
  }

  input {
    width: 100%;
    margin-block-start: -16px;
    padding: 8px;
    padding-block-start: 24px;
    padding-inline-start: calc(8px + 1.5ch);

    font-family: "Noto Sans Mono", monospace;
    font-weight: 600;
    color: var(--md-sys-color-on-secondary);

    appearance: none;
    background: var(--md-sys-color-secondary);
    border: none;
  }

  .io {
    --scrollbar-color: var(--md-sys-color-secondary);

    z-index: 1;

    overflow-y: auto;
    flex: 1;

    padding: 12px;

    color: var(--md-sys-color-on-secondary-container);

    background: var(--md-sys-color-secondary-container);
    border-radius: 0 0 16px 16px;
  }

  :focus-visible {
    outline: none;
  }

  fieldset {
    all: unset;

    position: relative;

    display: block;

    opacity: 0.8;

    transition: opacity 250ms ease;

    &:focus-within {
      opacity: 1;
    }
  }

  .anchor {
    overflow-anchor: auto;
    height: 1px;
  }

  code,
  samp,
  p {
    display: block;
    overflow-anchor: none;
    margin-block: 0.15rem;
  }

  p {
    display: flex;
    justify-content: center;

    margin-block-end: 1rem;
    padding: 0.25rem;

    color: var(--md-sys-color-on-secondary);

    background: var(--md-sys-color-secondary);
    border-radius: 8px;
  }

  code::before {
    content: "> ";
    margin-block-end: 0.25rem;
    font-weight: 900;
    color: var(--md-sys-color-primary);
  }

  ::selection {
    color: var(--md-sys-color-background);
    background: var(--md-sys-color-on-background);
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
