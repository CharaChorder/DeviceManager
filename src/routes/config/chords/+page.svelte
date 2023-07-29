<script lang="ts">
  import {chords} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import Index from "flexsearch"
  import {tick} from "svelte"
  import type {Chord} from "$lib/serial/chord"
  import LL from "../../../i18n/i18n-svelte"
  import {actionAutocomplete} from "$lib/action-autocomplete"

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
    document.startViewTransition(async () => {
      const query = (event.target as HTMLInputElement).value
      searchFilter = query && searchIndex ? searchIndex.search(query) : undefined
      await tick()
    })
  }

  $: items = searchFilter?.map(it => [$chords[it], it] as const) ?? $chords.map((it, i) => [it, i] as const)
</script>

<svelte:head>
  <title>Chord Manager</title>
</svelte:head>

<div>
  <input
    type="search"
    placeholder={$LL.configure.chords.search.PLACEHOLDER($chords.length)}
    use:actionAutocomplete
  />
</div>

<!--
{#if searchIndex}
  <input
    on:input={search}
    type="search"

  />
{/if}-->

<section>
  <table>
    {#each items.slice(0, 50) as [{ phrase, actions }, i]}
      <tr style="view-transition-name: chord-{i}">
        <th>
          {#each phrase as char}
            {KEYMAP_CODES[char].id}
          {/each}
        </th>
        <td>
          {#each actions as action}
            {@const keyInfo = KEYMAP_CODES[action]}
            {#if keyInfo}
              <abbr title={keyInfo.title} class:icon={!!keyInfo.icon}>{keyInfo.icon || keyInfo.id}</abbr>
            {:else}
              <pre>{action}</pre>
            {/if}
          {/each}
        </td>
      </tr>
    {/each}
  </table>
</section>

<style lang="scss">
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
    --scrollbar-color: var(--md-sys-color-surface-variant);

    scrollbar-gutter: stable;

    position: relative;

    overflow-x: hidden;
    overflow-y: auto;
    display: flex;

    padding-inline: 8px;

    border-radius: 16px;
  }

  table {
    overflow: hidden;
    min-width: min(90vw, 16.5cm);
    transition: all 1s ease;
  }

  table abbr {
    display: flex;
    align-items: center;
    justify-content: center;

    padding-block: 4px;
    padding-inline: 8px;

    font-size: 16px;
    font-style: normal;
    text-decoration: none;

    border: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;

    &.icon {
      font-size: 20px;
    }
  }

  th {
    text-align: start;
  }

  td {
    display: flex;
    gap: 4px;
    align-items: stretch;
    justify-content: flex-end;
  }
</style>
