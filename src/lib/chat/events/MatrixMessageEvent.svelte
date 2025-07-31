<script lang="ts">
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import type { Replay } from "$lib/charrecorder/core/types";
  import type { MatrixClient, MatrixEvent } from "matrix-js-sdk";
  import { fade } from "svelte/transition";
  import { matrixClient } from "../chat";

  let { event, replay = $bindable() }: { event: MatrixEvent; replay?: Replay } =
    $props();
</script>

<div>
  {#if event.event.content?.msgtype === "m.image"}
    <img
      src={$matrixClient.mxcUrlToHttp(event.event.content["url"])}
      alt={event.event.content["body"]}
    />
  {:else}
    <span class="content" style:opacity={replay && 0}
      >{event.event.content?.["body"]}</span
    >
  {/if}
  {#if replay}
    <div class="replay" out:fade>
      <CharRecorder
        {replay}
        cursor={true}
        keys={true}
        ondone={() => (replay = undefined)}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  div {
    position: relative;
    min-height: 1.5em;
  }

  img {
    border-radius: 8px;
    max-width: 100%;
    max-height: 16em;
  }

  .content {
    transition: opacity 0.2s;
  }

  .replay {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
