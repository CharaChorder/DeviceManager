<script lang="ts">
  import {layout} from "$lib/serial/connection"
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
  import ActionSelector from "$lib/components/layout/ActionSelector.svelte"
  import {popup} from "$lib/popup"
  import ActionListItem from "$lib/components/ActionListItem.svelte"

  export let id: number = 0
</script>

<table>
  {#each $layout as layer, i}
    <tr>
      <th class="icon">counter_{i + 1}</th>
      <ActionListItem id={layer[id]} />
    </tr>
  {/each}
</table>
