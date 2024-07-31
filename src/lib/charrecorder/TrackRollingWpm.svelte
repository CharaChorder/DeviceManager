<script lang="ts">
  import { getContext } from "svelte";
  import { RollingWpmReplayPlugin } from "./core/plugins/rolling-wpm";
  import type { ReplayPlayer } from "./core/player";

  const player: ReplayPlayer | undefined = getContext("replay");

  let { wpm = $bindable(0) } = $props();

  $effect(() => {
    if (!player) return;
    const tracker = new RollingWpmReplayPlugin();
    tracker.register(player);
    const unsubscribe = tracker.subscribe((value) => {
      wpm = value;
    });

    return unsubscribe;
  });
</script>
