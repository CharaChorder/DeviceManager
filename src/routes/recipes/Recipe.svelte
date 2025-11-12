<script lang="ts">
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import type { Replay } from "$lib/charrecorder/core/types";
  import type { E2eTest } from "./test-types";

  let { test }: { test: E2eTest } = $props();

  const replace = new Map<string, string>([
    ["SPACE", "Space"],
    ["ENTER", "Enter"],
    ["BKSP", "Backspace"],
    ["e", "KeyE"],
    ["t", "KeyT"],
  ]);

  const replaceOut = new Map<string, string>([
    ["SPACE", " "],
    ["ENTER", "\n"],
    ["BKSP", "Backspace"],
  ]);

  let timescale = $state(10);
  let idleHold = $state(500);
  let replayDelay = $state(1000);

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
          held.set(key, [
            replaceOut.get(key) ?? key,
            replace.get(key) ?? key,
            timeIndex,
            0,
          ]);
          replay.keys.push(held.get(key));
        }
        for (const [key, value] of held) {
          if (!it.keys.includes(key)) {
            value[3] = timeIndex - value[2];
            held.delete(key);
          }
        }
      }
      timeIndex += timescale * (it.step ?? 1);
      if (it.idle) {
        timeIndex += idleHold;
      }
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
            rows.at(-1)!.push(key);
          }
        }
      }
    }
    return rows;
  });
</script>

<section>
  <div class="replay">
    <CharRecorder
      {replay}
      cursor={true}
      ondone={() => setTimeout(() => (replay = { ...replay }), replayDelay)}
    />
  </div>

  <details>
    <summary>Breakdown</summary>
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
  </details>
</section>

<style lang="scss">
  section {
    font-family: monospace;
  }

  summary {
    cursor: pointer;
    margin-top: 0.5rem;
    font-weight: bold;
    user-select: none;
  }

  .replay {
    background: #f0f0f0;
    padding: 0.6rem;
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
