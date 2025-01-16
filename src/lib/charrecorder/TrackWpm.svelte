<script lang="ts">
  import { getContext } from "svelte";
  import { WpmReplayPlugin } from "./core/plugins/wpm";
  import type { ReplayPlayer } from "./core/player";

  const player: { player: ReplayPlayer | undefined } = getContext("replay");

  let { wpm = $bindable(0) } = $props();

  $effect(() => {
    if (!player.player) return;
    const tracker = new WpmReplayPlugin();
    tracker.register(player.player);
    const unsubscribe = tracker.subscribe((value) => {
      wpm = value;
    });

    return unsubscribe;
  });
</script>
