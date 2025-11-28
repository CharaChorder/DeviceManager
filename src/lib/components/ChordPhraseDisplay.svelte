<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import { onMount, tick } from "svelte";
  import { scale } from "svelte/transition";
  import ActionString from "$lib/components/ActionString.svelte";
  import { deviceMeta, serialPort } from "$lib/serial/connection";
  import { get } from "svelte/store";
  import { action } from "$lib/title";
  import semverGte from "semver/functions/gte";
  import { inputToAction } from "../../routes/(app)/config/chords/input-converter";
  import { selectAction } from "../../routes/(app)/config/chords/action-selector";

  interface InteractiveProps {
    interactive: true;
    ondeleteaction: (at: number, count?: number) => void;
    oninsertaction: (at: number, action: number) => void;
  }

  interface NonInteractiveProps {
    interactive: false;
    ondeleteaction?: never;
    oninsertaction?: never;
  }

  let {
    phrase,
    edited,
    interactive,
    oninsertaction,
    ondeleteaction,
  }: { phrase: number[]; edited: boolean } & (
    | NonInteractiveProps
    | InteractiveProps
  ) = $props();

  const JOIN_ACTION = 574;
  const NO_CONCATENATOR_ACTION = 256;

  onMount(() => {
    if (interactive && phrase.length === 0) {
      box?.focus();
    }
  });

  function keypress(event: KeyboardEvent) {
    if (!event.shiftKey && event.key === "ArrowUp") {
      addSpecial(event);
    } else if (!event.shiftKey && event.key === "ArrowLeft") {
      moveCursor(cursorPosition - 1);
    } else if (!event.shiftKey && event.key === "ArrowRight") {
      moveCursor(cursorPosition + 1);
    } else if (event.key === "Backspace") {
      if (interactive) {
        ondeleteaction!(cursorPosition - 1);
      }
      moveCursor(cursorPosition - 1);
    } else if (event.key === "Delete") {
      if (interactive) {
        ondeleteaction!(cursorPosition);
      }
    } else {
      if (event.key === "Shift") return;
      const action = inputToAction(event, get(serialPort)?.device === "X");
      if (action !== undefined) {
        oninsertaction!(cursorPosition, action);
        tick().then(() => moveCursor(cursorPosition + 1));
      }
    }
  }

  function moveCursor(to: number) {
    if (!box) return;
    cursorPosition = Math.max(0, Math.min(to, phrase.length));
    const item = box.children.item(cursorPosition) as HTMLElement;
    cursorOffset = item.offsetLeft + item.offsetWidth;
  }

  function clickCursor(event: MouseEvent) {
    if (box === undefined || event.target === button) return;
    const distance = (event as unknown as { layerX: number }).layerX;

    let i = 0;
    for (const child of box.children) {
      const { offsetLeft, offsetWidth } = child as HTMLElement;
      if (distance < offsetLeft + offsetWidth / 2) {
        moveCursor(i - 1);
        return;
      }
      i++;
    }
    moveCursor(i - 1);
  }

  function addSpecial(event: MouseEvent | KeyboardEvent) {
    selectAction(
      event,
      (action) => {
        oninsertaction!(cursorPosition, action);
        tick().then(() => moveCursor(cursorPosition + 1));
      },
      () => box?.focus(),
    );
  }

  function resolveAutospace(autospace: boolean) {
    if (autospace) {
      if (phrase.at(-1) === JOIN_ACTION) {
        if (
          phrase.every(
            (action, i, arr) =>
              $KEYMAP_CODES.get(action)?.printable || i === arr.length - 1,
          )
        ) {
          ondeleteaction!(phrase.length - 1);
        } else {
          return;
        }
      } else {
        if (isPrintable) {
          return;
        } else if (phrase.at(-1) === NO_CONCATENATOR_ACTION) {
          ondeleteaction!(phrase.length - 1);
        } else {
          oninsertaction!(phrase.length, JOIN_ACTION);
        }
      }
    } else {
      if (phrase.at(-1) === JOIN_ACTION) {
        ondeleteaction!(phrase.length - 1);
      } else {
        if (phrase.at(-1) === NO_CONCATENATOR_ACTION) {
          if (
            phrase.every(
              (action, i, arr) =>
                $KEYMAP_CODES.get(action)?.printable || i === arr.length - 1,
            )
          ) {
            return;
          } else {
            ondeleteaction!(phrase.length - 1);
          }
        } else {
          oninsertaction!(phrase.length, NO_CONCATENATOR_ACTION);
        }
      }
    }
  }

  let button: HTMLButtonElement | undefined = $state();
  let box: HTMLDivElement | undefined = $state();
  let cursorPosition = 0;
  let cursorOffset = $state(0);

  let hasFocus = $state(false);

  let isPrintable = $derived(
    phrase.every((action) => $KEYMAP_CODES.get(action)?.printable === true),
  );
  let supportsAutospace = $derived(
    semverGte($deviceMeta?.version ?? "0.0.0", "2.1.0"),
  );
  let hasAutospace = $derived(isPrintable || phrase.at(-1) === JOIN_ACTION);

  let displayPhrase = $derived(
    phrase.filter(
      (it, i, arr) =>
        !(
          (i === 0 && it === JOIN_ACTION) ||
          (i === arr.length - 1 &&
            (it === JOIN_ACTION || it === NO_CONCATENATOR_ACTION))
        ),
    ),
  );
</script>

<div
  class="wrapper"
  class:edited
  onclick={interactive
    ? () => {
        box.focus();
      }
    : undefined}
>
  {#if supportsAutospace}
    <label
      class="auto-space-edit"
      use:action={{ title: "Remove previous concatenator" }}
      ><span class="icon">join_inner</span><input
        checked={phrase[0] === JOIN_ACTION}
        disabled={!interactive}
        onchange={interactive
          ? (event) => {
              const autospace = hasAutospace;
              if ((event.target as HTMLInputElement).checked) {
                if (phrase[0] !== JOIN_ACTION) {
                  oninsertaction!(0, JOIN_ACTION);
                }
              } else {
                if (phrase[0] === JOIN_ACTION) {
                  ondeleteaction!(0, 1);
                }
              }
              tick().then(() => resolveAutospace(autospace));
            }
          : undefined}
        type="checkbox"
      /></label
    >
  {/if}
  <div
    onkeydown={interactive ? keypress : undefined}
    onmousedown={interactive ? clickCursor : undefined}
    role="textbox"
    tabindex="0"
    bind:this={box}
    onfocusin={interactive ? () => (hasFocus = true) : undefined}
    onfocusout={interactive
      ? (event) => {
          if (event.relatedTarget !== button) hasFocus = false;
        }
      : undefined}
  >
    {#if hasFocus}
      <div transition:scale class="cursor" style:translate="{cursorOffset}px 0">
        <button class="icon" bind:this={button} onclick={addSpecial}>add</button
        >
      </div>
    {:else}
      <div></div>
      <!-- placeholder for cursor placement -->
    {/if}
    <ActionString actions={displayPhrase} />
  </div>
  {#if supportsAutospace}
    <label class="auto-space-edit" use:action={{ title: "Add concatenator" }}
      ><span class="icon">space_bar</span><input
        checked={hasAutospace}
        disabled={!interactive}
        onchange={interactive
          ? (event) =>
              resolveAutospace((event.target as HTMLInputElement).checked)
          : undefined}
        type="checkbox"
      /></label
    >
  {/if}
  <sup>•</sup>
</div>

<style lang="scss">
  sup {
    translate: 0 -40%;
    opacity: 0;
    transition: opacity 250ms ease;
  }

  .cursor {
    position: absolute;
    transform: translateX(-50%);
    translate: 0 0;

    transition: translate 50ms ease;

    background: var(--md-sys-color-on-secondary-container);

    width: 2px;
    height: 100%;

    button {
      position: absolute;
      top: -24px;
      left: 0;
      border: 2px solid currentcolor;
      border-radius: 12px 12px 12px 0;

      background: var(--md-sys-color-secondary-container);
      padding: 0;

      height: 24px;

      color: var(--md-sys-color-on-secondary-container);
    }
  }

  .edited {
    color: var(--md-sys-color-primary);

    sup {
      opacity: 1;
    }
  }

  .auto-space-edit {
    margin-inline: 8px;
    border-radius: 4px;
    background: var(--md-sys-color-tertiary-container);
    padding-inline: 0;
    height: 1em;
    color: var(--md-sys-color-on-tertiary-container);
    font-size: 1.3em;

    &:first-of-type:not(:has(:checked)),
    &:last-of-type:has(:checked) {
      opacity: 0;
    }
  }

  .wrapper:hover .auto-space-edit {
    opacity: 1;
  }

  .wrapper {
    display: flex;

    position: relative;
    align-items: center;

    padding-block: 4px;

    height: 1em;

    &::after,
    &::before {
      position: absolute;
      bottom: -4px;

      opacity: 0;

      transition:
        opacity 150ms ease,
        scale 250ms ease;
      background: currentcolor;

      width: calc(100% - 8px);
      height: 1px;
      content: "";
    }

    &::after {
      scale: 0 1;
      transition-duration: 250ms;
    }

    &:hover::before {
      opacity: 0.3;
    }

    &:has(> :focus-within)::after {
      scale: 1;
      opacity: 1;
    }
  }

  [role="textbox"] {
    display: flex;

    position: relative;
    align-items: center;
    cursor: text;
    white-space: pre;

    &:focus-within {
      outline: none;
    }
  }
</style>
