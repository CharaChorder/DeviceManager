<script>
  import {serialLog, serialPort} from "$lib/serial/connection.js"
  import {slide} from "svelte/transition"

  /**
   * @param event {InputEvent}
   */
  function submit(event) {
    event.preventDefault()
    $serialPort.send(value.trim())
    value = ""
    io.scrollTo({top: io.scrollHeight})
  }

  /** @type {string} */
  let value

  /** @type {HTMLDivElement} */
  let io

  export let resizable = false
</script>

<form on:submit={submit}>
  <div bind:this={io} class="io" class:resizable>
    {#each $serialLog as { type, value }}
      <p class={type} transition:slide>{value}</p>
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

    &.resizable {
      resize: both;
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
    background: transparent;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--md-sys-color-on-secondary);
    border-radius: 4px;
  }

  ::-webkit-resizer {
    display: none;
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

  .terminal.resizable fieldset::after {
    content: "";

    position: absolute;
    right: 6px;
    bottom: 8px;
    rotate: -45deg;

    width: 10px;
    height: 5px;

    background: var(--md-sys-color-on-secondary);
    clip-path: polygon(0 0, 100% 0, 50% 100%);
  }

  .anchor {
    overflow-anchor: auto;
    height: 1px;
  }

  p {
    overflow-anchor: none;
    margin-block: 0.15rem;
  }

  p.input {
    margin-block-end: 0.25rem;
    font-weight: bold;
  }

  p.system {
    display: flex;
    justify-content: center;

    margin-block-end: 1rem;
    padding: 0.25rem;

    color: var(--md-sys-color-on-secondary);

    background: var(--md-sys-color-secondary);
    border-radius: 8px;
  }

  p.input::before {
    content: "> ";
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
