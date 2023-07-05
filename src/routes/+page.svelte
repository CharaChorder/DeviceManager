<script>
  import {chords, serialPort} from "$lib/serial/connection.js"
  import keySymbols from "$lib/assets/key-symbols.json"
</script>

<svelte:head>
  <title>dot i/o</title>
</svelte:head>

<h1>dot i/o V2</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<h2>Chords</h2>
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

<style lang="scss">
  table i {
    display: block;

    aspect-ratio: 1;
    padding-block: 4px;
    padding-inline: 8px;

    font-style: normal;

    border: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
  }

  td {
    display: flex;
    gap: 4px;
  }
</style>
