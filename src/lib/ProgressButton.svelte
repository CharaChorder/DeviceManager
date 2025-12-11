<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    onclick,
    children,
    working,
    progress,
    error,
    disabled = false,
    element = $bindable(),
    ...restProps
  }: {
    onclick: () => void;
    children: Snippet;
    working: boolean;
    progress: number;
    error?: string;
    disabled?: boolean;
    element?: HTMLButtonElement;
  } & HTMLButtonAttributes = $props();
</script>

<button
  class:working={working && (progress <= 0 || progress >= 1)}
  class:progress={working && progress > 0 && progress < 1}
  style:--progress="{progress * 100}%"
  class:primary={!error}
  class:error={!!error}
  disabled={disabled || working}
  bind:this={element}
  {...restProps}
  {onclick}>{@render children()}</button
>

<style lang="scss">
  @keyframes rotate {
    0% {
      transform: rotate(120deg);
      opacity: 0;
    }

    20% {
      transform: rotate(120deg);
      opacity: 0;
    }

    60% {
      opacity: 1;
    }

    100% {
      transform: rotate(270deg);
      opacity: 0;
    }
  }

  button {
    --height: 42px;
    --border-radius: calc(var(--height) / 2);

    position: relative;
    transition:
      border 200ms ease,
      color 200ms ease;

    margin: 6px;

    outline: 2px dashed currentcolor;
    outline-offset: 4px;

    border: 2px solid currentcolor;
    border-radius: var(--border-radius);

    background: var(--md-sys-color-background);
    height: var(--height);
    overflow: hidden;

    &.primary {
      background: none;
      color: var(--md-sys-color-primary);
    }

    &.progress,
    &.working {
      border-color: transparent;
    }

    &.working::before {
      position: absolute;
      z-index: -1;
      border-radius: calc(var(--border-radius) - 2px);
      background: var(--md-sys-color-background);
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      content: "";
    }

    &.working::after {
      position: absolute;
      z-index: -2;
      animation: rotate 1s ease-out forwards infinite;
      background: var(--md-sys-color-primary);
      width: 120%;
      height: 30%;
      content: "";
    }

    &.progress::after {
      position: absolute;
      left: 0;
      opacity: 0.2;
      z-index: -2;
      background: var(--md-sys-color-primary);
      width: var(--progress);
      height: 100%;
      content: "";
    }
  }
</style>
