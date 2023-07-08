<script lang="ts">
  import {chords} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import FlexSearch from "flexsearch"
  import type {Index} from "flexsearch"
  import {tick} from "svelte"
  import type {Chord} from "$lib/serial/chord"
  import {getSharableUrl, stringifyCompressed} from "$lib/serial/serialization"

  $: searchIndex = $chords?.length > 0 ? buildIndex($chords) : undefined

  function buildIndex(chords: Chord[]): Index {
    const index = new FlexSearch({tokenize: "full"})
    chords.forEach((chord, i) => {
      index.add(i, chord.phrase)
    })
    return index
  }

  let searchFilter: number[] | undefined

  function search(event) {
    document.startViewTransition(async () => {
      const query = event.target.value
      searchFilter = query && searchIndex ? searchIndex.search(query) : undefined
      await tick()
    })
  }

  async function downloadBackup() {
    const downloadUrl = URL.createObjectURL(await stringifyCompressed($chords))
    const element = document.createElement("a")
    element.setAttribute("download", "chords.json.gz")
    element.href = downloadUrl
    element.setAttribute("target", "_blank")
    element.click()
    URL.revokeObjectURL(downloadUrl)
  }

  async function createShareUrl() {
    console.log(await getSharableUrl("chords", $chords))
  }

  $: items = searchFilter?.map(it => [$chords[it], it]) ?? $chords.map((it, i) => [it, i])
</script>

<svelte:head>
  <title>Chord Manager</title>
</svelte:head>

{#if searchIndex}
  <input on:input={search} type="search" placeholder="Search {$chords.length} chords" />
{/if}

<section>
  <table>
    {#each items.slice(0, 50) as [{ phrase, actions }, i]}
      <tr style="view-transition-name: chord-{i}">
        <th>{phrase}</th>
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
  <div class="backup">
    <button class="icon" title="Sharable URL" on:click={createShareUrl()}>share</button>
    <div class="icon" title="Chords have been backed up to this browser.">cloud_done</div>
    <button class="icon" title="Restore local chord backup">backup</button>
    <button class="icon" title="Download local chord backup" on:click={downloadBackup}>cloud_download</button>
  </div>
</section>

<style lang="scss">
  input[type="search"] {
    width: 300px;
    padding-block: 8px;
    padding-inline: 32px;

    font-size: 16px;
    color: var(--md-sys-color-on-surface-variant);
    text-align: center;

    background: var(--md-sys-color-surface-variant);
    clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
    filter: brightness(80%);
    border: none;

    transition: all 250ms ease;

    &::placeholder {
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.2;
    }

    &:focus {
      filter: brightness(90%);
      outline: none;
    }
  }

  .backup {
    display: flex;
    flex-direction: column;
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
