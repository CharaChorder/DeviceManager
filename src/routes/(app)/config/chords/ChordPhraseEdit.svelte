<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import { onMount, tick } from "svelte";
  import { changes, ChangeType } from "$lib/undo-redo";
  import type { ChordInfo } from "$lib/undo-redo";
  import { scale } from "svelte/transition";
  import ActionString from "$lib/components/ActionString.svelte";
  import { selectAction } from "./action-selector";
  import { inputToAction } from "./input-converter";
  import { deviceMeta, serialPort } from "$lib/serial/connection";
  import { get } from "svelte/store";
  import { action } from "$lib/title";
  import semverGte from "semver/functions/gte";

  let { chord }: { chord: ChordInfo } = $props();

  const JOIN_ACTION = 574;
  const NO_CONCATENATOR_ACTION = 256;

  onMount(() => {
    if (chord.phrase.length === 0) {
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
      deleteAction(cursorPosition - 1);
      moveCursor(cursorPosition - 1);
    } else if (event.key === "Delete") {
      deleteAction(cursorPosition);
    } else {
      if (event.key === "Shift") return;
      const action = inputToAction(event, get(serialPort)?.device === "X");
      if (action !== undefined) {
        insertAction(cursorPosition, action);
        tick().then(() => moveCursor(cursorPosition + 1));
      }
    }
  }

  function moveCursor(to: number) {
    if (!box) return;
    cursorPosition = Math.max(0, Math.min(to, chord.phrase.length));
    const item = box.children.item(cursorPosition) as HTMLElement;
    cursorOffset = item.offsetLeft + item.offsetWidth;
  }

  function deleteAction(at: number, count = 1) {
    if (!(at in chord.phrase)) return;
    changes.update((changes) => {
      changes.push([
        {
          type: ChangeType.Chord,
          id: chord.id,
          actions: chord.actions,
          phrase: chord.phrase.toSpliced(at, count),
        },
      ]);
      return changes;
    });
  }

  function insertAction(at: number, action: number) {
    changes.update((changes) => {
      changes.push([
        {
          type: ChangeType.Chord,
          id: chord.id,
          actions: chord.actions,
          phrase: chord.phrase.toSpliced(at, 0, action),
        },
      ]);
      return changes;
    });
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
        insertAction(cursorPosition, action);
        tick().then(() => moveCursor(cursorPosition + 1));
      },
      () => box?.focus(),
    );
  }

  function resolveAutospace(autospace: boolean) {
    if (autospace) {
      if (chord.phrase.at(-1) === JOIN_ACTION) {
        if (
          chord.phrase.every(
            (action, i, arr) =>
              $KEYMAP_CODES.get(action)?.printable || i === arr.length - 1,
          )
        ) {
          deleteAction(chord.phrase.length - 1);
        } else {
          return;
        }
      } else {
        if (isPrintable) {
          return;
        } else if (chord.phrase.at(-1) === NO_CONCATENATOR_ACTION) {
          deleteAction(chord.phrase.length - 1);
        } else {
          insertAction(chord.phrase.length, JOIN_ACTION);
        }
      }
    } else {
      if (chord.phrase.at(-1) === JOIN_ACTION) {
        deleteAction(chord.phrase.length - 1);
      } else {
        if (chord.phrase.at(-1) === NO_CONCATENATOR_ACTION) {
          if (
            chord.phrase.every(
              (action, i, arr) =>
                $KEYMAP_CODES.get(action)?.printable || i === arr.length - 1,
            )
          ) {
            return;
          } else {
            deleteAction(chord.phrase.length - 1);
          }
        } else {
          insertAction(chord.phrase.length, NO_CONCATENATOR_ACTION);
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
    chord.phrase.every(
      (action) => $KEYMAP_CODES.get(action)?.printable === true,
    ),
  );
  let supportsAutospace = $derived(
    semverGte($deviceMeta?.version ?? "0.0.0", "2.1.0"),
  );
  let hasAutospace = $derived(
    isPrintable || chord.phrase.at(-1) === JOIN_ACTION,
  );

  let displayPhrase = $derived(
    chord.phrase.filter(
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
  class:edited={!chord.deleted && chord.phraseChanged}
  onclick={() => {
    box.focus();
  }}
>
  {#if supportsAutospace}
    <label
      class="auto-space-edit"
      use:action={{ title: "Remove previous concatenator" }}
      ><span class="icon">join_inner</span><input
        checked={chord.phrase[0] === JOIN_ACTION}
        onchange={(event) => {
          const autospace = hasAutospace;
          if ((event.target as HTMLInputElement).checked) {
            if (chord.phrase[0] !== JOIN_ACTION) {
              insertAction(0, JOIN_ACTION);
            }
          } else {
            if (chord.phrase[0] === JOIN_ACTION) {
              deleteAction(0, 1);
            }
          }
          tick().then(() => resolveAutospace(autospace));
        }}
        type="checkbox"
      /></label
    >
  {/if}
  <div
    onkeydown={keypress}
    onmousedown={clickCursor}
    role="textbox"
    tabindex="0"
    bind:this={box}
    onfocusin={() => (hasFocus = true)}
    onfocusout={(event) => {
      if (event.relatedTarget !== button) hasFocus = false;
    }}
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
        onchange={(event) =>
          resolveAutospace((event.target as HTMLInputElement).checked)}
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

    width: 2px;
    height: 100%;

    background: var(--md-sys-color-on-secondary-container);

    transition: translate 50ms ease;

    button {
      position: absolute;
      top: -24px;
      left: 0;

      height: 24px;
      padding: 0;

      color: var(--md-sys-color-on-secondary-container);

      background: var(--md-sys-color-secondary-container);
      border: 2px solid currentcolor;
      border-radius: 12px 12px 12px 0;
    }
  }

  .edited {
    color: var(--md-sys-color-primary);

    sup {
      opacity: 1;
    }
  }

  .auto-space-edit {
    padding-inline: 0;
    font-size: 1.3em;
    margin-inline: 8px;
    background: var(--md-sys-color-tertiary-container);
    color: var(--md-sys-color-on-tertiary-container);
    height: 1em;
    border-radius: 4px;

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
    align-items: center;

    position: relative;

    padding-block: 4px;

    height: 1em;

    &::after,
    &::before {
      content: "";

      position: absolute;
      bottom: -4px;

      width: calc(100% - 8px);
      height: 1px;

      opacity: 0;
      background: currentcolor;

      transition:
        opacity 150ms ease,
        scale 250ms ease;
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
    cursor: text;

    position: relative;

    display: flex;
    align-items: center;
    white-space: pre;

    &:focus-within {
      outline: none;
    }
  }
</style>
