<script lang="ts">
  import { getContext } from "svelte";
  import { browser } from "$app/environment";
  import type { InferredChord } from "./core/types.js";
  import { ChordsReplayPlugin } from "./core/plugins/chords.js";
  import type { ReplayPlayer } from "./core/player.js";

  const player: { player: ReplayPlayer | undefined } = getContext("replay");

  let {
    chords = $bindable([]),
    count = 1,
  }: {
    chords: InferredChord[];
    count?: number;
  } = $props();

  if (browser) {
    $effect(() => {
      if (!player.player) return;
      const tracker = new ChordsReplayPlugin();
      tracker.register(player.player);
      const unsubscribe = tracker.subscribe((value) => {
        chords = value.slice(-count);
      });

      return unsubscribe;
    });
  }
</script>
