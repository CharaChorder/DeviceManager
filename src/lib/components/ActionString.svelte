<script lang="ts">
  import Action from "$lib/components/Action.svelte";
  import type { KeyInfo } from "$lib/serial/keymap-codes";

  export let actions: Array<number | KeyInfo>;
  export let display: "keys" | "inline-keys" = "inline-keys";
</script>

{#each actions as action, i (`${typeof action === "number" ? action : action.code}:${i}`)}
  <Action {action} {display} />
{/each}
