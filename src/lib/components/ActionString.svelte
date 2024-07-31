<script lang="ts">
  import Action from "$lib/components/Action.svelte";
  import type { KeyInfo } from "$lib/serial/keymap-codes";

  let {
    actions,
    display = "inline-keys",
  }: { actions: Array<number | KeyInfo>; display?: "keys" | "inline-keys" } =
    $props();
</script>

{#each actions as action, i (`${typeof action === "number" ? action : action.code}:${i}`)}
  <Action {action} {display} />
{/each}
