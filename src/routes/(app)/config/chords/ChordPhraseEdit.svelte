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
  import { action, actionTooltip } from "$lib/title";
  import semverGte from "semver/functions/gte";
  import Action from "$lib/components/Action.svelte";
  import AutospaceSelector from "$lib/chord-editor/AutospaceSelector.svelte";

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
      moveCursor(cursorPosition - 1, true);
    } else if (!event.shiftKey && event.key === "ArrowRight") {
      moveCursor(cursorPosition + 1, true);
    } else if (event.key === "Backspace") {
      deleteAction(cursorPosition - 1, 1, true);
      moveCursor(cursorPosition - 1, true);
    } else if (event.key === "Delete") {
      deleteAction(cursorPosition, 1, true);
    } else {
      if (event.key === "Shift" || event.key === "Meta") return;
      const action = inputToAction(event, get(serialPort)?.device === "X");
      if (action !== undefined) {
        insertAction(cursorPosition, action);
        tick().then(() => moveCursor(cursorPosition + 1));
      }
    }
  }

  function moveCursor(to: number, user = false) {
    if (!box) return;
    cursorPosition = Math.max(
      user ? chord.phrase.findIndex((it, i, arr) => !isHidden(it, i, arr)) : 0,
      Math.min(
        to,
        user
          ? chord.phrase.findLastIndex((it, i, arr) => !isHidden(it, i, arr)) +
              1 || chord.phrase.length
          : chord.phrase.length,
      ),
    );
    const item = box.children.item(cursorPosition) as HTMLElement;
    cursorOffset = item.offsetLeft + item.offsetWidth;
  }

  function deleteAction(at: number, count = 1, user = false) {
    if (user && isHidden(chord.phrase[at]!, at, chord.phrase)) return;
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
        moveCursor(i - 1, true);
        return;
      }
      i++;
    }
    moveCursor(i - 1, true);
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
          moveCursor(cursorPosition, true);
        } else {
          return;
        }
      } else {
        if (isPrintable) {
          return;
        } else if (chord.phrase.at(-1) === NO_CONCATENATOR_ACTION) {
          deleteAction(chord.phrase.length - 1);
          moveCursor(cursorPosition, true);
        } else {
          insertAction(chord.phrase.length, JOIN_ACTION);
          moveCursor(cursorPosition, true);
        }
      }
    } else {
      if (chord.phrase.at(-1) === JOIN_ACTION) {
        deleteAction(chord.phrase.length - 1);
        moveCursor(cursorPosition, true);
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
            moveCursor(cursorPosition, true);
          }
        } else {
          insertAction(chord.phrase.length, NO_CONCATENATOR_ACTION);
          moveCursor(cursorPosition, true);
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

  function isHidden(action: number, index: number, array: number[]) {
    return (
      (index === 0 && action === JOIN_ACTION) ||
      (index === array.length - 1 &&
        (action === JOIN_ACTION || action === NO_CONCATENATOR_ACTION))
    );
  }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  role="textbox"
  class="wrapper"
  class:edited={!chord.deleted && chord.phraseChanged}
  onclick={() => {
    box?.focus();
  }}
>
  {#if supportsAutospace}
    <AutospaceSelector
      variant="start"
      value={chord.phrase[0] === JOIN_ACTION}
      onchange={async (event) => {
        const autospace = hasAutospace;
        if ((event.target as HTMLInputElement).checked) {
          if (chord.phrase[0] === JOIN_ACTION) {
            deleteAction(0, 1);
            await tick();
            moveCursor(cursorPosition - 1, true);
          }
        } else {
          if (chord.phrase[0] !== JOIN_ACTION) {
            insertAction(0, JOIN_ACTION);
            moveCursor(cursorPosition + 1, true);
          }
        }
        await tick();
        resolveAutospace(autospace);
      }}
    />
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
    {#each chord.phrase as action, i}
      {#if isHidden(action, i, chord.phrase)}
        <span style:display="none"></span>
      {:else}
        <Action display="inline-keys" {action} />
      {/if}
    {/each}
  </div>
  {#if supportsAutospace}
    <AutospaceSelector
      variant="end"
      value={!hasAutospace}
      onchange={(event) =>
        resolveAutospace((event.target as HTMLInputElement).checked)}
    />
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

    &:hover {
      --auto-space-show: 1;

      &::before {
        opacity: 0.3;
      }
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
