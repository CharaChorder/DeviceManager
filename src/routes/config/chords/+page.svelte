<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import FlexSearch from "flexsearch";
  import LL from "../../../i18n/i18n-svelte";
  import { action } from "$lib/title";
  import { onDestroy, onMount, setContext, tick } from "svelte";
  import { changes, ChangeType, chords } from "$lib/undo-redo";
  import type { ChordInfo } from "$lib/undo-redo";
  import { derived, writable } from "svelte/store";
  import ChordEdit from "./ChordEdit.svelte";
  import { crossfade, fly } from "svelte/transition";
  import ChordActionEdit from "./ChordActionEdit.svelte";
  import { browser } from "$app/environment";
  import { expoOut } from "svelte/easing";
  import { osLayout } from "$lib/os-layout";

  const resultSize = 38;
  let results: HTMLElement;
  const pageSize = writable(0);
  let resizeObserver: ResizeObserver;

  let abortIndexing: (() => void) | undefined;
  let progress = 0;

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

  let index = new FlexSearch.Index({ tokenize: "full" });
  let searchIndex = writable<FlexSearch.Index | undefined>(undefined);
  $: {
    abortIndexing?.();
    progress = 0;
    buildIndex($chords, $osLayout).then(searchIndex.set);
  }

  async function buildIndex(
    chords: ChordInfo[],
    osLayout: Map<string, string>,
  ): Promise<FlexSearch.Index> {
    if (chords.length === 0 || !browser) return index;
    index = new FlexSearch.Index({ tokenize: "full" });
    let abort = false;
    abortIndexing = () => {
      abort = true;
    };
    for (let i = 0; i < chords.length; i++) {
      if (abort) return index;

      const chord = chords[i]!;
      progress = i;

      if ("phrase" in chord) {
        await index.addAsync(
          i,
          chord.phrase
            .map((it) => {
              const info = KEYMAP_CODES.get(it);
              if (!info) return "";

              return (
                (info.keyCode && osLayout.get(info.keyCode)) || info.id || ""
              );
            })
            .filter((it) => !!it)
            .join(""),
        );
      }
    }
    return index;
  }

  const searchFilter = writable<number[] | undefined>(undefined);

  async function search(index: FlexSearch.Index, event: Event) {
    const query = (event.target as HTMLInputElement).value;
    searchFilter.set(
      query && searchIndex
        ? ((await index.searchAsync(query)) as number[])
        : undefined,
    );
    page = 0;
  }

  function insertChord(actions: number[]) {
    const id = JSON.stringify(actions);
    if ($chords.some((it) => JSON.stringify(it.actions) === id)) {
      alert($LL.configure.chords.DUPLICATE());
      return;
    }
    changes.update((changes) => {
      changes.push({
        type: ChangeType.Chord,
        id: actions,
        actions,
        phrase: [],
      });
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

  let page = 0;
</script>

<svelte:head>
  <title>Chord Manager - CharaChorder Device Manager</title>
  <meta name="description" content="Manage your chords" />
</svelte:head>

<div class="search-container">
  <input
    type="search"
    placeholder={$LL.configure.chords.search.PLACEHOLDER(progress + 1)}
    on:input={(event) => search($searchIndex, event)}
    class:loading={progress !== $chords.length - 1}
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
    on:click={() => (page = Math.max(page - 1, 0))}
    use:action={{ shortcut: "ctrl+left" }}>navigate_before</button
  >
  <button
    class="icon"
    on:click={() => (page = Math.min(page + 1, $lastPage))}
    use:action={{ shortcut: "ctrl+right" }}>navigate_next</button
  >
</div>

<section bind:this={results}>
  <div class="results">
    <!-- fixes some unresponsiveness -->
    {#await tick() then}
      <table transition:fly={{ y: 48, easing: expoOut }}>
        {#if $lastPage !== -1}
          {#if page === 0}
            <tr
              ><th class="new-chord"
                ><ChordActionEdit
                  on:submit={({ detail }) => insertChord(detail)}
                /></th
              ><td /><td /></tr
            >
          {/if}
          {#each $items.slice(page * $pageSize - (page === 0 ? 0 : 1), (page + 1) * $pageSize - 1) as [chord] (JSON.stringify(chord?.id))}
            {#if chord}
              <tr>
                <ChordEdit {chord} />
              </tr>
            {/if}
          {/each}
        {:else}
          <caption>{$LL.configure.chords.search.NO_RESULTS()}</caption>
        {/if}
      </table>
    {/await}
  </div>
  <textarea placeholder={$LL.configure.chords.TRY_TYPING()}></textarea>
</section>

<style lang="scss">
  .search-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .paginator {
    display: flex;
    justify-content: flex-end;
    min-width: 8ch;
  }

  .new-chord :global(.add) {
    visibility: hidden;
  }

  textarea {
    transition: outline-color 250ms ease;
    background: none;
    color: inherit;
    border: 1px dashed var(--md-sys-color-outline);
    outline: 2px solid transparent;
    outline-offset: -1px;
    margin: 2px;
    padding: 8px;
    border-radius: 4px;

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
    width: 512px;
    margin-block-start: 16px;
    padding-block: 8px;
    padding-inline: 16px;

    font-size: 16px;
    color: inherit;

    background: none;
    border: 0 solid var(--md-sys-color-surface-variant);
    border-bottom-width: 1px;

    transition: all 250ms ease;

    @media (prefers-contrast: more) {
      border-color: var(--md-sys-color-outline);
      border-style: dashed;
    }

    &::placeholder {
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.8;
    }

    &:focus {
      border-color: var(--md-sys-color-primary);
      border-style: solid;
      outline: none;
    }

    &.loading {
      opacity: 0.4;
    }
  }

  section {
    position: relative;
    display: flex;

    overflow: hidden;

    height: 100%;
    padding-inline: 8px;

    border-radius: 16px;
  }

  .results {
    height: 100%;
    min-width: min(90vw, 16.5cm);
  }

  table {
    height: fit-content;
    overflow: hidden;
    transition: all 1s ease;
  }
</style>
