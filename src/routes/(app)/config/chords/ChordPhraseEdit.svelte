<script lang="ts">
  import { onMount, tick } from "svelte";
  import { changes, ChangeType } from "$lib/undo-redo";
  import type { ChordInfo } from "$lib/undo-redo";
  import { scale } from "svelte/transition";
  import ActionString from "$lib/components/ActionString.svelte";
  import { selectAction } from "./action-selector";
  import { inputToAction } from "./input-converter";
  import { serialPort } from "$lib/serial/connection";
  import { get } from "svelte/store";

  let { chord }: { chord: ChordInfo } = $props();

  onMount(() => {
    if (chord.phrase.length === 0) {
      box?.focus();
    }
  });

  function keypress(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      addSpecial(event);
    } else if (event.key === "ArrowLeft") {
      moveCursor(cursorPosition - 1);
    } else if (event.key === "ArrowRight") {
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

  let button: HTMLButtonElement | undefined = $state();
  let box: HTMLDivElement | undefined = $state();
  let cursorPosition = 0;
  let cursorOffset = $state(0);

  let hasFocus = $state(false);
</script>

<div
  onkeydown={keypress}
  onmousedown={clickCursor}
  role="textbox"
  tabindex="0"
  bind:this={box}
  class:edited={!chord.deleted && chord.phraseChanged}
  onfocusin={() => (hasFocus = true)}
  onfocusout={(event) => {
    if (event.relatedTarget !== button) hasFocus = false;
  }}
>
  {#if hasFocus}
    <div transition:scale class="cursor" style:translate="{cursorOffset}px 0">
      <button class="icon" bind:this={button} onclick={addSpecial}>add</button>
    </div>
  {:else}
    <div></div>
    <!-- placeholder for cursor placement -->
  {/if}
  <ActionString actions={chord.phrase} />
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

  [role="textbox"] {
    cursor: text;

    position: relative;

    display: flex;
    align-items: center;

    height: 1em;
    padding-block: 4px;

    &::after,
    &::before {
      content: "";

      position: absolute;
      bottom: -4px;

      width: 100%;
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

    &:focus-within {
      outline: none;

      &::after {
        scale: 1;
        opacity: 1;
      }
    }
  }
</style>
