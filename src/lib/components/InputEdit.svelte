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
      <td><button>{action?.title || action?.id} <span class="icon">edit</span></button></td>
    </tr>
  {/each}
</table>

<style lang="scss">
  span.icon {
    opacity: 0;
    transition: opacity 250ms ease;
  }

  button {
    cursor: pointer;

    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    font-family: "Noto Sans Mono", monospace;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);

    background: transparent;
    border: none;
    border-radius: 8px;

    transition: all 250ms ease;
  }

  button:hover > span.icon {
    opacity: 1;
  }
</style>
