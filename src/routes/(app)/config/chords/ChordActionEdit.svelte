<script lang="ts">
  import type { ChordInfo } from "$lib/undo-redo";
  import { changes, chordHashes, ChangeType } from "$lib/undo-redo";
  import { createEventDispatcher } from "svelte";
  import LL from "$i18n/i18n-svelte";
  import ActionString from "$lib/components/ActionString.svelte";
  import { selectAction } from "./action-selector";
  import { serialPort } from "$lib/serial/connection";
  import { get } from "svelte/store";
  import { inputToAction } from "./input-converter";
  import { hashChord } from "$lib/serial/chord";

  export let chord: ChordInfo | undefined = undefined;

  const dispatch = createEventDispatcher();

  let pressedKeys = new Set<number>();
  let editing = false;

  function compare(a: number, b: number) {
    return a - b;
  }

  function makeChordInput(...actions: number[]) {
    const compound = compoundInputs[0]
      ? hashChord(compoundInputs[0].actions)
      : 0;
    return [
      ...Array.from(
        {
          length: 12 - actions.length,
        },
        (_, i) => (compound >> (i * 10)) & 0x3ff,
      ),
      ...actions.toSorted(compare),
    ];
  }

  function edit() {
    pressedKeys = new Set();
    editing = true;
  }

  function keydown(event: KeyboardEvent) {
    // This is obviously a tradeoff
    if (event.key === "Tab" || event.key === "Escape") return;
    if (!editing) return;
    event.preventDefault();
    const input = inputToAction(event, get(serialPort)?.device === "X");
    if (input == undefined) {
      alert("Invalid key");
      return;
    }
    pressedKeys.add(input);
    pressedKeys = pressedKeys;
  }

  function keyup() {
    if (!editing) return;
    editing = false;
    if (pressedKeys.size < 1) return;
    if (!chord) return dispatch("submit", makeChordInput(...pressedKeys));
    changes.update((changes) => {
      changes.push({
        type: ChangeType.Chord,
        id: chord!.id,
        actions: makeChordInput(...pressedKeys),
        phrase: chord!.phrase,
      });
      return changes;
    });
    return undefined;
  }

  function addSpecial(event: MouseEvent) {
    selectAction(event, (action) => {
      changes.update((changes) => {
        changes.push({
          type: ChangeType.Chord,
          id: chord!.id,
          actions: makeChordInput(...chordActions!, action),
          phrase: chord!.phrase,
        });
        return changes;
      });
    });
  }

  function* resolveCompound(chord?: ChordInfo) {
    if (!chord) return;
    let current = chord;
    for (let i = 0; i < 10; i++) {
      if (current.actions[3] !== 0) return;
      const compound = current.actions
        .slice(0, 3)
        .reduce((a, b, i) => a | (b << (i * 10)));
      if (compound === 0) return;
      const next = $chordHashes.get(compound);
      if (!next) {
        return null;
      }

      current = next;
      yield next;
    }
    return;
  }

  $: chordActions = chord?.actions
    .slice(chord.actions.lastIndexOf(0) + 1)
    .toSorted(compare);
  $: compoundInputs = [...resolveCompound(chord)].reverse();
</script>

<button
  class:deleted={chord && chord.deleted}
  class:edited={chord && chord.actionsChanged}
  class:invalid={chord &&
    chordActions &&
    (chordActions.length < 2 ||
      chordActions.some((it, i) => chordActions[i] !== it))}
  class="chord"
  on:click={edit}
  on:keydown={keydown}
  on:keyup={keyup}
  on:blur={keyup}
>
  {#if editing && pressedKeys.size === 0}
    <span>{$LL.configure.chords.HOLD_KEYS()}</span>
  {:else if !editing && !chord}
    <span>{$LL.configure.chords.NEW_CHORD()}</span>
  {/if}
  {#if !editing}
    {#each compoundInputs as compound}
      <sub
        ><ActionString
          display="keys"
          actions={compound.actions.slice(compound.actions.lastIndexOf(0) + 1)}
        ></ActionString>
      </sub>
      <span>&rarr;</span>
    {/each}
  {/if}
  <ActionString
    display="keys"
    actions={editing ? [...pressedKeys].sort(compare) : chordActions ?? []}
  />
  <sup>•</sup>
  <button class="icon add" on:click|stopPropagation={addSpecial}
    >add_circle</button
  >
</button>

<style lang="scss">
  span {
    opacity: 0.5;

    @media (prefers-contrast: more) {
      opacity: 0.8;
    }
  }

  sup {
    translate: 0 -60%;
    opacity: 0;
    transition: opacity 250ms ease;
  }

  .add {
    font-size: 18px;
    height: 20px;
    opacity: 0;
    --icon-fill: 1;
  }

  .chord:hover .add {
    opacity: 1;
  }

  .chord {
    position: relative;

    display: inline-flex;
    gap: 4px;

    height: 32px;
    margin-inline: 4px;

    &:focus-within {
      outline: none;
    }
  }

  .chord::after {
    content: "";

    position: absolute;
    top: 50%;
    transform-origin: center left;
    translate: -20px 0;
    scale: 0 1;

    width: calc(100% - 60px);
    height: 1px;

    background: currentcolor;

    transition:
      scale 250ms ease,
      color 250ms ease;
  }

  .edited {
    color: var(--md-sys-color-primary);

    & > sup {
      opacity: 1;
    }
  }

  .invalid {
    color: var(--md-sys-color-error);
  }

  .deleted {
    color: var(--md-sys-color-error);

    &::after {
      scale: 1;
    }
  }
</style>
