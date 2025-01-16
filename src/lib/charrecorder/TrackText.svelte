<script lang="ts">
  import { getContext } from "svelte";
  import type { ReplayPlayer } from "./core/player";
  import { TextPlugin } from "./core/plugins/text";

  const player: { player: ReplayPlayer | undefined } = getContext("replay");

  let { text = $bindable("") } = $props();

  $effect(() => {
    if (!player.player) return;
    const tracker = new TextPlugin();
    tracker.register(player.player);
    const unsubscribe = tracker.subscribe((value) => {
      text = value;
    });

    return unsubscribe;
  });
</script>
