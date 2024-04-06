<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import flexsearch from "flexsearch";
  import LL from "../../../i18n/i18n-svelte";
  import { action } from "$lib/title";
  import { onDestroy, onMount, setContext } from "svelte";
  import { changes, ChangeType, chords } from "$lib/undo-redo";
  import type { ChordInfo } from "$lib/undo-redo";
  import { derived, writable } from "svelte/store";
  import ChordEdit from "./ChordEdit.svelte";
  import { crossfade } from "svelte/transition";
  import ChordActionEdit from "./ChordActionEdit.svelte";

  const resultSize = 38;
  let results: HTMLElement;
  const pageSize = writable(0);
  let resizeObserver: ResizeObserver;

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

  $: searchIndex = $chords?.length > 0 ? buildIndex($chords) : undefined;

  function buildIndex(chords: ChordInfo[]): flexsearch.Index {
    const index = new flexsearch.Index({ tokenize: "full" });
    chords.forEach((chord, i) => {
      if ("phrase" in chord) {
        index.add(
          i,
          chord.phrase
            .map((it) => KEYMAP_CODES.get(it)?.id)
            .filter((it) => !!it)
            .join(""),
        );
      }
    });
    return index;
  }

  const searchFilter = writable<number[] | undefined>(undefined);

  function search(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    searchFilter.set(
      query && searchIndex
        ? (searchIndex.search(query) as number[])
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
    placeholder={$LL.configure.chords.search.PLACEHOLDER($chords.length)}
    on:input={search}
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
  <table>
    {#if page === 0}
      <tr
        ><th class="new-chord"
          ><ChordActionEdit
            on:submit={({ detail }) => insertChord(detail)}
          /></th
        ><td /><td /></tr
      >
    {/if}
    {#if $lastPage !== -1}
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
    outline: 1px dashed var(--md-sys-color-surface-variant);
    margin: 2px;
    border: none;
    padding: 8px;
    border-radius: 4px;

    @media (prefers-contrast: more) {
      outline-color: var(--md-sys-color-outline);

      &:focus {
        outline-width: 2px;
      }
    }

    &:focus {
      outline-color: var(--md-sys-color-primary);
    }
  }

  caption {
    margin-top: 156px;
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
      opacity: 0.2;

      @media (prefers-contrast: more) {
        opacity: 0.8;
      }
    }

    &:focus {
      border-color: var(--md-sys-color-primary);
      border-style: solid;
      outline: none;
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

  table {
    height: fit-content;
    overflow: hidden;
    min-width: min(90vw, 16.5cm);
    transition: all 1s ease;
  }
</style>
