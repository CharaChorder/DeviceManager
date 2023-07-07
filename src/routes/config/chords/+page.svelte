<script lang="ts">
  import {chords} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
</script>

<svelte:head>
  <title>Chord Manager</title>
</svelte:head>

<section>
  <p>You have {$chords.length} chords</p>
  <table>
    {#each $chords as { phrase, actions }}
      <tr>
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
</section>

<style lang="scss">
  section {
    position: relative;
    overflow-y: auto;
    border-radius: 16px;
  }

  table {
    min-width: min(90vw, 16.5cm);
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
