<script lang="ts">
  import {layout} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"

  export let id: number = 0
</script>

<table>
  {#each $layout as layer, i}
    {@const action = KEYMAP_CODES[layer[id]]}
    <tr>
      <th class="icon">counter_{i + 1}</th>
      <td>{action?.id}</td>
    </tr>
  {/each}
</table>
