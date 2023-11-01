<script lang="ts">
  import {changes, chords} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import Index from "flexsearch"
  import type {Chord} from "$lib/serial/chord"
  import LL from "../../../i18n/i18n-svelte"
  import {action} from "$lib/title"
  import {onDestroy, onMount} from "svelte"
  import ActionStringEdit from "$lib/components/ActionStringEdit.svelte"

  const resultSize = 38
  let results: HTMLElement
  let pageSize: number
  let resizeObserver: ResizeObserver

  onMount(() => {
    resizeObserver = new ResizeObserver(() => {
      pageSize = Math.floor(results.clientHeight / resultSize)
    })
    pageSize = Math.floor(results.clientHeight / resultSize)
    resizeObserver.observe(results)
  })

  onDestroy(() => {
    resizeObserver?.disconnect()
  })

  $: searchIndex = $chords?.length > 0 ? buildIndex($chords) : undefined

  function buildIndex(chords: Chord[]): Index {
    const index = new Index({tokenize: "full"})
    chords.forEach((chord, i) => {
      index.add(i, chord.phrase.map(it => KEYMAP_CODES[it].id).join(""))
    })
    return index
  }

  let searchFilter: number[] | undefined

  function search(event: Event) {
    const query = (event.target as HTMLInputElement).value
    searchFilter = query && searchIndex ? searchIndex.search(query) : undefined
  }

  $: items = searchFilter?.map(it => [$chords[it], it] as const) ?? $chords.map((it, i) => [it, i] as const)
  $: lastPage = Math.ceil(items.length / pageSize) - 1

  let page = 0
  $: {
    items
    page = 0
  }
</script>

<svelte:head>
  <title>Chord Manager</title>
</svelte:head>

<div class="search-container">
  <input
    type="search"
    placeholder={$LL.configure.chords.search.PLACEHOLDER($chords.length)}
    on:input={search}
  />
  <div class="paginator">
    {#if lastPage !== -1}
      {page + 1} / {lastPage + 1}
    {:else}
      - / -
    {/if}
  </div>
  <button class="icon" on:click={() => (page = Math.max(page - 1, 0))} use:action={{shortcut: "ctrl+left"}}
    >navigate_before</button
  >
  <button
    class="icon"
    on:click={() => (page = Math.min(page + 1, lastPage))}
    use:action={{shortcut: "ctrl+right"}}>navigate_next</button
  >
</div>

<section bind:this={results}>
  <table>
    {#if lastPage !== -1}
      {#each items.slice(page * pageSize, (page + 1) * pageSize) as [chord]}
        <tr>
          <th>
            <ActionStringEdit actions={chord.phrase} />
          </th>
          <td>
            <ActionStringEdit actions={chord.actions} />
          </td>
          <td class="table-buttons">
            <button class="icon compact">share</button>
            <button class="icon compact" on:click={() => $changes.push({chords: [{delete: chord}]})}
              >delete</button
            >
          </td>
        </tr>
      {/each}
    {:else}
      <caption> No Results </caption>
    {/if}
  </table>
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

    &::placeholder {
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.2;
    }

    &:focus {
      border-color: var(--md-sys-color-primary);
      outline: none;
    }
  }

  section {
    position: relative;

    overflow: hidden;

    height: 100%;
    padding-inline: 8px;

    border-radius: 16px;
  }

  table {
    overflow: hidden;
    min-width: min(90vw, 16.5cm);
    transition: all 1s ease;
  }

  th {
    text-align: start;
  }

  .table-buttons {
    opacity: 0;
    transition: opacity 75ms ease;
  }

  tr:hover > .table-buttons {
    opacity: 1;
  }
</style>
