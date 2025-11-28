<script lang="ts">
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import { ReplayPlayer } from "$lib/charrecorder/core/player";
  import type { Replay } from "$lib/charrecorder/core/types";
  import ActionString from "$lib/components/ActionString.svelte";
  import ChordPhraseDisplay from "$lib/components/ChordPhraseDisplay.svelte";
  import type { E2eTest, E2eTestItem } from "$lib/meta/types/meta";
  import { osLayout } from "$lib/os-layout";
  import { deviceMeta } from "$lib/serial/connection";
  import { KEYMAP_IDS } from "$lib/serial/keymap-codes";
  import type { ChordInfo } from "$lib/undo-redo";

  let { test, paused = false }: { test: E2eTest; paused?: boolean } = $props();

  let timescale = $state(10);
  let idleHold = $state(500);
  let pressHold = $state(250);
  let replayDelay = $state(1000);

  let time = $state(0);

  function getKeyRaw(key: string): string {
    return $KEYMAP_IDS.get(key)?.keyCode ?? key;
  }

  const keyMap = new Map<string, string>(
    Object.entries({
      ENTER: "\n",
      SPACE: " ",
      TAB: "\t",
      BKSP: "Backspace",
    }),
  );

  function getKeyMapped(key: string, shift: boolean): string {
    let value = $osLayout.get(getKeyRaw(key)) ?? key;
    value = keyMap.get(value) ?? value;
    return shift ? value.toUpperCase() : value;
  }

  function advanceTime(
    step: E2eTestItem,
    timescale: number,
    idleHold: number,
  ): number {
    return (
      (step.skip ?? step.step ?? 1) * timescale +
      (step.idle ? idleHold : 0) +
      (step.press ? pressHold : 0)
    );
  }

  let replay: Replay = $derived.by(() => {
    const replay: Replay = {
      start: 0,
      finish: 0,
      keys: [],
    };
    let timeIndex = 0;
    let held = new Map<string, any>();
    for (const it of test.test) {
      if (it.keys) {
        for (const key of it.keys) {
          if (held.has(key)) continue;
          const raw = getKeyRaw(key);
          const mapped = getKeyMapped(key, it.modifiers?.["lshift"] == true);
          held.set(key, [mapped, raw, timeIndex, 0]);
          replay.keys.push(held.get(key));
        }
        for (const [key, value] of held) {
          if (!it.keys.includes(key)) {
            value[3] = timeIndex - value[2];
            held.delete(key);
          }
        }
      }
      timeIndex += advanceTime(it, timescale, idleHold);
    }

    replay.finish = timeIndex;
    return replay;
  });

  let graph = $derived.by(() => {
    const rows: string[][] = [[]];
    for (const it of test.test) {
      if (it.keys?.includes("BKSP")) {
        if (rows.at(-1)!.at(-1) === " ") {
          rows.at(-1)!.pop();
        } else {
          rows.push(Array.from({ length: rows.at(-1)!.length - 1 }, () => " "));
        }
      } else {
        for (const key of it.keys ?? []) {
          if (key === "SPACE") {
            rows.at(-1)!.push("␣");
          } else if (key === "ENTER") {
            rows.at(-1)!.push("↵");
          } else {
            rows
              .at(-1)!
              .push(getKeyMapped(key, it.modifiers?.["lshift"] == true));
          }
        }
      }
    }
    return rows;
  });

  let chords = $derived(
    test.test
      .flatMap((step) => step.addChords ?? [])
      .map(({ input, output }) => ({
        input: input.map((chord) =>
          chord.map((it) => $KEYMAP_IDS.get(it)?.code ?? 0),
        ),
        output: output.map((it) => $KEYMAP_IDS.get(it)?.code ?? 0),
      })),
  );

  let settings = $derived(
    test.test
      .flatMap((step) => (step.settings ? Object.entries(step.settings) : []))
      .flatMap(([key, value]) => {
        const category = $deviceMeta?.settings.find((it) => it.name === key);
        return Object.entries(value).map(([subkey, subvalue]) => [
          category?.items.find((it) => it.name === subkey),
          subvalue,
        ]);
      }),
  );

  let keysUsed = $derived.by(() => {
    const keys = new Map<number, number[]>();
    let time = 0;
    for (const step of test.test) {
      for (const key of step.press ?? []) {
        const keyCode = $KEYMAP_IDS.get(key)?.code ?? 0;
        if (!keys.has(keyCode)) {
          keys.set(keyCode, []);
        }
        keys.get(keyCode)!.push(time);
      }

      for (const key of step.release ?? []) {
        const keyCode = $KEYMAP_IDS.get(key)?.code ?? 0;
        keys.get(keyCode)!.push(time);
      }

      time += advanceTime(step, timescale, idleHold);
    }

    return keys;
  });

  function isKeyPressed(times: number[], time: number): boolean {
    return (
      times.findIndex(
        (t, i, arr) => time >= t && (arr[i + 1] ?? Infinity) > time,
      ) %
        2 ===
      0
    );
  }
</script>

<div class="replay">
  <CharRecorder
    {replay}
    {paused}
    cursor={true}
    keys={false}
    ondone={() => setTimeout(() => (replay = { ...replay }), replayDelay)}
    ontick={(t) => (time = t)}
  />
</div>

<div class="keystaff">
  {#each keysUsed as [action, times]}
    <div class="keystaff-item" class:active={isKeyPressed(times, time)}>
      <ActionString actions={[action]} />
    </div>
  {/each}
</div>

<details>
  <div class="graph">
    {#each graph as row, i}
      {#each row as char, j}
        {#if char !== " "}
          <div
            class:deleted={(graph[i + 1]?.findIndex((it) => it !== " ") ??
              Infinity) <= j}
            style:grid-row={i + 1}
            style:grid-column={j + 1}
          >
            {char}
          </div>
        {/if}
      {/each}
    {/each}
  </div>

  {#if chords.length > 0}
    <h3>Chords Used</h3>
    <div class="chords">
      {#each chords as { input, output }}
        <div class="input">
          {#each input as actions}
            <div class="compound">
              <ActionString display="keys" {actions} />
            </div>
          {/each}
        </div>

        <div class="output">
          <ActionString actions={output} />
        </div>
      {/each}
    </div>
  {/if}
  {#if settings.length > 0}
    <h3>Settings Changed</h3>
    <ul>
      {#each settings as [item, value]}
        <li>
          {item?.name ?? "Unknown Setting"}: {value?.toString()}
        </li>
      {/each}
    </ul>
  {/if}
</details>

<style lang="scss">
  .chords {
    display: grid;
    column-gap: 1rem;
    align-items: center;
    justify-items: center;
    width: fit-content;

    .compound {
      display: inline-flex;
      gap: 2px;
    }

    .input {
      display: flex;
      grid-column: 1;
      align-items: center;
      justify-self: center;
      gap: 8px;
    }

    .output {
      grid-column: 2;
      justify-self: start;
    }
  }

  .keystaff {
    $expo-out: cubic-bezier(0.16, 1, 0.3, 1);
    $time: 1s;

    display: flex;
    gap: 4px;
    width: fit-content;

    .keystaff-item {
      display: flex;
      justify-content: center;
      align-items: center;
      translate: 0 -8px;
      opacity: 0;
      transition:
        opacity $time $expo-out,
        translate $time $expo-out;
      border-radius: 4px;
      width: 100%;
      height: 24px;

      &.active {
        translate: 0;
        opacity: 1;
        transition: none;
      }
    }
  }

  .details {
    position: absolute;
    transform-origin: top;
    scale: 1 0.5;
    z-index: 1;
    margin-left: -17px;
    border: 1px solid var(--md-sys-color-outline);
    border-top: none;
    background-color: var(--md-sys-color-surface);
    padding: 16px;
    width: calc(100% + 2px);
  }

  summary {
    cursor: pointer;
    margin-top: 0.5rem;
    font-weight: bold;
    user-select: none;
  }

  .replay {
    border-radius: 0.4rem;
    background: var(--md-sys-color-surface-variant);
    padding: 0.6rem;
    width: fit-content;
    color: var(--md-sys-color-on-surface-variant);
    font-weight: bold;
    font-size: 1.2rem;
  }

  .graph {
    display: grid;
    align-items: center;
    justify-items: center;
    width: min-content;
  }

  .deleted {
    opacity: 0.6;
    text-decoration: line-through;
  }
</style>
