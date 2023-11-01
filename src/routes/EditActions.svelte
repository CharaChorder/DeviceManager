<script lang="ts">
  import LL from "../i18n/i18n-svelte"
  import {changes} from "$lib/serial/connection"
  import type {Change} from "$lib/serial/connection"
  import {fly} from "svelte/transition"
  import {action} from "$lib/title"

  function undo() {
    redoQueue = [$changes.pop()!, ...redoQueue]
    changes.update(it => it)
  }

  function redo() {
    const [change, ...queue] = redoQueue
    changes.update(it => {
      it.push(change)
      return it
    })
    redoQueue = queue
  }
  let redoQueue: Change[] = []

  function apply() {
    // TODO
  }
</script>

<!-- <svg viewBox="0 0 36 36" style="width: 48px">
  <defs>
    <rect
      id="mouth"
      x="13"
      y="13"
      width="512"
      height="10"
      rx="5"
      style="transform-origin: center; animation-direction: alternate-reverse"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="scale"
        values="1; 0.25; 1"
        keyTimes="0; 0.33; 1"
        dur="0.4"
        repeatCount="indefinite"
      />
    </rect>
    <mask id="inner-mask">
      <rect x="0" y="0" width="36" height="36" />
      <use fill="white" href="#mouth" />
    </mask>
    <mask id="clip">
      <rect x="0" y="0" width="36" height="36" fill="white" />
      <use fill="black" href="#mouth" />
    </mask>
  </defs>

  <g mask="url(#clip)" style="transform-origin: center">
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="scale"
      values="1 1;0.9 0.8; 1 1"
      keyTimes="0; 0.33; 1"
      dur="0.4"
      repeatCount="indefinite"
    />
    <circle cx="18" cy="18" r="14" stroke="currentcolor" fill="none" stroke-width="5" />
    <circle cx="18" cy="18" r="10" fill="currentcolor" stroke-width="6" />
  </g>
  <g mask="url(#inner-mask)">
    <text
      mask="url(#inner-mask)"
      x="18"
      y="17.2"
      fill="currentcolor"
      text-anchor="start"
      dominant-baseline="central"
      font-size="8"
      font-weight="bold"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="translate"
        from="0"
        to="-76.8"
        dur="1.6"
        repeatCount="indefinite"
      />
      c&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;o&nbsp;&nbsp;&nbsp;s&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;o&nbsp;&nbsp;&nbsp;s
    </text>
  </g>
</svg> -->

<button
  use:action={{title: $LL.saveActions.UNDO(), shortcut: "ctrl+z"}}
  class="icon"
  disabled={$changes.length === 0}
  on:click={undo}>undo</button
>
<button
  use:action={{title: $LL.saveActions.REDO(), shortcut: "ctrl+y"}}
  class="icon"
  disabled={redoQueue.length === 0}
  on:click={redo}>redo</button
>
<div class="separator" />
<button use:action={{title: $LL.saveActions.SAVE(), shortcut: "ctrl+shift+s"}} class="icon">save</button>
{#if $changes.length !== 0}
  <button
    class="click-me"
    transition:fly={{x: 8}}
    on:click={apply}
    use:action={{
      title: $LL.changes.TITLE(),
      shortcut: "ctrl+s",
    }}><span class="icon">bolt</span>{$LL.saveActions.APPLY()}</button
  >
{/if}

<style lang="scss">
  .pacman {
    position: relative;

    aspect-ratio: 1;
    height: 32px;

    background: currentcolor;
    border: 8px solid currentcolor;
    border-radius: 100%;
    outline: 6px solid currentcolor;
    outline-offset: 2px;

    animation: pacman 0.2s linear infinite alternate-reverse;

    &::before {
      content: "";

      position: absolute;
      top: 0;
      left: 25%;

      width: 200%;
      height: 100%;

      background: var(--md-sys-color-background);
      animation: squish 0.2s linear infinite alternate-reverse;
      border-radius: 16px;
    }

    &::after {
      content: "c c o s";
      position: absolute;
      display: flex;
      width: 500%;
      animation: go 1s linear infinite;
    }
  }

  @keyframes go {
    from {
      translate: 0 0;
    }
    to {
      translate: -100% 0;
    }
  }

  @keyframes squish {
    from {
      scale: 1;
    }

    to {
      scale: 1 0.5;
    }
  }

  @keyframes pacman {
    to {
      scale: 1;
    }

    to {
      scale: 0.9;
    }
  }

  .click-me {
    display: flex;
    align-items: center;
    justify-content: center;

    height: fit-content;
    margin-inline: 8px;
    padding-block: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 8px;

    font-family: inherit;
    font-weight: bold;
    color: var(--md-sys-color-primary);

    border: 2px solid var(--md-sys-color-primary);
    border-radius: 18px;
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: var(--md-sys-color-outline-variant);
  }
</style>
