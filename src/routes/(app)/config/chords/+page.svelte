<script lang="ts">
  import { KEYMAP_CODES, type KeyInfo } from "$lib/serial/keymap-codes";
  import FlexSearch, { type Index } from "flexsearch";
  import LL from "$i18n/i18n-svelte";
  import { actionTooltip } from "$lib/title";
  import { onDestroy, onMount, setContext, tick } from "svelte";
  import { changes, ChangeType, chords } from "$lib/undo-redo";
  import type { ChordChange, ChordInfo } from "$lib/undo-redo";
  import { derived, writable } from "svelte/store";
  import ChordEdit from "./ChordEdit.svelte";
  import { crossfade, fly } from "svelte/transition";
  import ChordActionEdit from "./ChordActionEdit.svelte";
  import { browser } from "$app/environment";
  import { expoOut } from "svelte/easing";
  import { osLayout } from "$lib/os-layout";
  import randomTips from "$lib/assets/random-tips/en.json";
  import { deviceMeta } from "$lib/serial/connection";
  import { restoreFromFile } from "$lib/backup/backup";

  const resultSize = 38;
  let results: HTMLElement;
  const pageSize = writable(0);
  let resizeObserver: ResizeObserver;

  let abortIndexing: (() => void) | undefined;
  let progress = $state(0);

  onMount(() => {
    resizeObserver = new ResizeObserver(() => {
      pageSize.set(Math.floor(results.clientHeight / resultSize));
    });
    pageSize.set(Math.floor(results.clientHeight / resultSize));
    resizeObserver.observe(results);
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  let index = new FlexSearch.Index();
  let searchIndex = writable<Index | undefined>(undefined);
  $effect(() => {
    abortIndexing?.();
    progress = 0;
    buildIndex($chords, $osLayout, $KEYMAP_CODES).then(searchIndex.set);
  });

  function encodeChord(
    chord: ChordInfo,
    osLayout: Map<string, string>,
    codes: Map<number, KeyInfo>,
    onlyPhrase: boolean = false,
  ) {
    const plainPhrase: string[] = [""];
    const tags = new Set<string>();
    const extraActions = new Set<string>();
    const extraCodes = new Set<string>();

    for (const actionCode of chord.phrase ?? []) {
      const action = codes.get(actionCode);
      if (!action) {
        extraCodes.add(`0x${actionCode.toString(16)}`);
        continue;
      }

      const osCode = action.keyCode && osLayout.get(action.keyCode);
      const token = osCode?.length === 1 ? osCode : action.display || action.id;
      if (!token) {
        extraCodes.add(`0x${action.code.toString(16)}`);
        continue;
      }

      if (
        (token === "SPACE" || /^\s$/.test(token)) &&
        plainPhrase.at(-1) !== ""
      ) {
        plainPhrase.push("");
      } else if (token.length === 1) {
        plainPhrase[plainPhrase.length - 1] =
          plainPhrase[plainPhrase.length - 1] + token;
      } else {
        extraActions.add(token);
      }
    }

    if (chord.phrase?.[0] === 298) {
      tags.add("suffix");
    }
    if (
      ["ARROW_LT", "ARROW_RT", "ARROW_UP", "ARROW_DN"].some((it) =>
        extraActions.has(it),
      )
    ) {
      tags.add("cursor warp");
    }
    if (
      ["CTRL", "ALT", "GUI", "ENTER", "TAB"].some((it) => extraActions.has(it))
    ) {
      tags.add("macro");
    }
    if (chord.actions[0] !== 0) {
      tags.add("compound");
    }

    const input = chord.actions
      .slice(chord.actions.lastIndexOf(0) + 1)
      .map((it) => {
        const info = codes.get(it);
        if (!info) return `0x${it.toString(16)}`;
        const osCode = info.keyCode && osLayout.get(info.keyCode);
        const result = osCode?.length === 1 ? osCode : info.id;
        return result ?? `0x${it.toString(16)}`;
      });

    if (onlyPhrase) {
      return plainPhrase.join(" ");
    }

    return [
      ...plainPhrase,
      `+${input.join("+")}`,
      ...tags,
      ...extraActions,
      ...extraCodes,
    ].join(" ");
  }

  async function buildIndex(
    chords: ChordInfo[],
    osLayout: Map<string, string>,
    codes: Map<number, KeyInfo>,
  ): Promise<Index> {
    if (chords.length === 0 || !browser) return index;

    index = new FlexSearch.Index({
      tokenize: "full",
      encode(phrase: string) {
        return phrase.split(/\s+/).flatMap((it) => {
          if (/^[A-Z_]+$/.test(it)) {
            return it;
          }
          if (it.startsWith("+")) {
            return it
              .slice(1)
              .split("+")
              .map((it) => `+${it}`);
          }
          return it.toLowerCase();
        });
      },
    });

    let abort = false;
    abortIndexing = () => {
      abort = true;
    };

    const batchSize = 200;
    const batches = Math.ceil(chords.length / batchSize);

    for (let b = 0; b < batches; b++) {
      if (abort) return index;

      const start = b * batchSize;
      const end = Math.min((b + 1) * batchSize, chords.length);
      const batch = chords.slice(start, end);

      const promises = batch.map((chord, i) => {
        const chordIndex = start + i;
        progress = chordIndex + 1;

        if ("phrase" in chord) {
          const encodedChord = encodeChord(chord, osLayout, codes);
          return index.addAsync(chordIndex, encodedChord);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
    }

    return index;
  }

  const searchFilter = writable<number[] | undefined>(undefined);
  let currentSearchQuery = $state("");

  async function search(index: Index, event: Event) {
    const query = (event.target as HTMLInputElement).value;
    currentSearchQuery = query;
    searchFilter.set(
      query && searchIndex
        ? ((await index.searchAsync(query)) as number[])
        : undefined,
    );
    page = 0;
  }

  // Re-run search when chords change to fix stale indices
  $effect(() => {
    if (currentSearchQuery && $searchIndex) {
      search($searchIndex, { target: { value: currentSearchQuery } } as any);
    }
  });

  function insertChord(actions: number[]) {
    const id = JSON.stringify(actions);
    if ($chords.some((it) => JSON.stringify(it.actions) === id)) {
      alert($LL.configure.chords.DUPLICATE());
      return;
    }
    changes.update((changes) => {
      changes.push([
        {
          type: ChangeType.Chord,
          id: actions,
          actions,
          phrase: [],
        },
      ]);
      return changes;
    });
  }

  function downloadVocabulary() {
    const vocabulary = new Set(
      $chords.map((it) =>
        "phrase" in it
          ? encodeChord(it, $osLayout, $KEYMAP_CODES, true).trim()
          : "",
      ),
    );
    vocabulary.delete("");
    const blob = new Blob([Array.from(vocabulary).join("|")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocabulary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearChords() {
    changes.update((changes) => {
      changes.push(
        $chords.map<ChordChange>((it) => ({
          type: ChangeType.Chord,
          id: it.id,
          actions: it.actions,
          phrase: it.phrase,
          deleted: true,
        })),
      );
      return changes;
    });
  }

  const items = derived(
    [searchFilter, chords],
    ([filter, chords]) =>
      filter?.map((it) => [chords[it], it] as const) ??
      chords.map((it, i) => [it, i] as const),
  );
  const lastPage = derived(
    [items, pageSize],
    ([items, pageSize]) => Math.ceil((items.length + 1) / pageSize) - 1,
  );

  setContext("cursor-crossfade", crossfade({}));

  let page = $state(0);
</script>

<svelte:head>
  <title>Chord Manager - CharaChorder Device Manager</title>
  <meta name="description" content="Manage your chords" />
</svelte:head>

<div class="search-container">
  <input
    type="search"
    placeholder={$LL.configure.chords.search.PLACEHOLDER(progress)}
    value={currentSearchQuery}
    oninput={(event) => $searchIndex && search($searchIndex, event)}
    class:loading={progress !== $chords.length}
  />
  <div class="paginator">
    {#if $lastPage !== -1}
      {page + 1} / {$lastPage + 1}
    {:else}
      - / -
    {/if}
  </div>
  <button
    class="icon"
    onclick={() => (page = Math.max(page - 1, 0))}
    {@attach actionTooltip("", "ctrl+left")}>navigate_before</button
  >
  <button
    class="icon"
    onclick={() => (page = Math.min(page + 1, $lastPage))}
    {@attach actionTooltip("", "ctrl+right")}>navigate_next</button
  >
</div>

<section bind:this={results}>
  <!-- fixes some unresponsiveness -->
  {#await tick() then}
    <div class="results">
      <table transition:fly={{ y: 48, easing: expoOut }}>
        {#if $lastPage !== -1}
          <tbody>
            {#if page === 0}
              <tr
                ><th class="new-chord"
                  ><ChordActionEdit
                    onsubmit={(action) => insertChord(action)}
                  /></th
                ><td></td><td></td></tr
              >
            {/if}
            {#each $items.slice(page * $pageSize - (page === 0 ? 0 : 1), (page + 1) * $pageSize - 1) as [chord]}
              {#if chord}
                <ChordEdit {chord} onduplicate={() => (page = 0)} />
              {/if}
            {/each}</tbody
          >
        {:else}
          <caption>{$LL.configure.chords.search.NO_RESULTS()}</caption>
        {/if}
      </table>
    </div>
    <div class="sidebar">
      <textarea
        placeholder={$LL.configure.chords.TRY_TYPING() +
          "\n\nDid you know? " +
          randomTips[Math.floor(randomTips.length * Math.random())]}
      ></textarea>
      <button onclick={clearChords}
        ><span class="icon">delete_sweep</span>
        Clear Chords</button
      >
      <div>
        {#each Object.entries($deviceMeta?.factoryDefaults?.chords ?? {}) as [title, library]}
          <button onclick={() => restoreFromFile(library)}
            ><span class="icon">library_add</span>{title}</button
          >
        {/each}
      </div>
      <button onclick={downloadVocabulary}
        ><span class="icon">download</span>
        {$LL.configure.chords.VOCABULARY()}</button
      >
    </div>
  {/await}
</section>

<style lang="scss">
  .search-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .paginator {
    display: flex;
    justify-content: flex-end;
    min-width: 8ch;
  }

  .sidebar {
    display: flex;
    flex-direction: column;

    > button {
      padding-inline-start: 0;
    }
  }

  textarea {
    flex: 1;
    transition: outline-color 250ms ease;
    margin: 2px;
    outline: 2px solid transparent;
    outline-offset: -1px;
    border: 1px dashed var(--md-sys-color-outline);
    border-radius: 4px;
    background: none;
    padding: 8px;
    color: inherit;

    &:focus {
      outline-color: var(--md-sys-color-primary);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.4;
    }
  }

  input[type="search"] {
    transition: all 250ms ease;
    margin-block-start: 16px;
    border: 0 solid var(--md-sys-color-surface-variant);
    border-bottom-width: 1px;

    background: none;
    padding-inline: 16px;
    padding-block: 8px;
    width: 512px;
    color: inherit;

    font-size: 16px;

    @media (prefers-contrast: more) {
      border-style: dashed;
      border-color: var(--md-sys-color-outline);
    }

    &::placeholder {
      opacity: 0.8;
      color: var(--md-sys-color-on-surface-variant);
    }

    &:focus {
      outline: none;
      border-style: solid;
      border-color: var(--md-sys-color-primary);
    }

    &.loading {
      opacity: 0.4;
    }
  }

  section {
    display: flex;
    position: relative;

    border-radius: 16px;
    padding-inline: 8px;

    height: 100%;

    overflow: hidden;
  }

  .results {
    min-width: min(90vw, 20cm);
    height: 100%;
  }

  table {
    transition: all 1s ease;
    height: fit-content;
    overflow-y: hidden;
  }
</style>
