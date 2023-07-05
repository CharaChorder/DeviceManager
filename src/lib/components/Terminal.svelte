<script>
  import {serialLog, serialPort} from "$lib/serial/connection.js"
  import {slide} from "svelte/transition"

  /**
   * @param event {KeyboardEvent}
   */
  function keypress(event) {
    if (event.code === "Enter") {
      event.preventDefault()
      const command = prompt.textContent.trim()
      prompt.textContent = ""
      $serialPort.send(command)
      io.scrollTo({top: io.scrollHeight})
    }
  }

  /** @type {HTMLSpanElement} */
  let prompt

  /** @type {HTMLDivElement} */
  let io
</script>

<div class="terminal" tabindex="0" on:focus={() => prompt.focus()}>
  <div bind:this={io} class="io">
    {#each $serialLog as { type, value }}
      <p class={type} transition:slide>{value}</p>
    {/each}
    <div class="anchor" />
  </div>
  <div class="prompt">
    <b>$</b><span on:keypress={keypress} bind:this={prompt} contenteditable class="prompt" />
    <div class="resize-me" />
  </div>
</div>

<style lang="scss">
  .terminal {
    resize: both;

    position: relative;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: calc(min(100%, 16.5cm));
    height: 8cm;

    font-family: "Noto Sans Mono", monospace;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-secondary);

    background: var(--md-sys-color-secondary);
    border-radius: 16px;
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

  .io {
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

  .prompt {
    position: relative;
    margin: 0.5rem;
  }

  .resize-me {
    position: absolute;
    right: -2px;
    bottom: 0;
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
