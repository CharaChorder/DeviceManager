<script>
  import {chords} from "$lib/serial/connection.js"
  import keySymbols from "$lib/assets/key-symbols.json"
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
            <i>{keySymbols[action] || action}</i>
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

  table i {
    display: block;

    padding-block: 4px;
    padding-inline: 8px;

    font-style: normal;

    border: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
  }

  th {
    text-align: start;
  }

  td {
    display: flex;
    gap: 4px;
  }
</style>
