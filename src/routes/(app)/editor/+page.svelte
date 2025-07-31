<script lang="ts">
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import type { InferredChord, Replay } from "$lib/charrecorder/core/types";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import TrackRollingWpm from "$lib/charrecorder/TrackRollingWpm.svelte";
  import { fade } from "svelte/transition";

  let recorder: ReplayRecorder = $state(new ReplayRecorder());
  let replay: Replay | undefined = $state();

  let wpm = $state(0);
  let chords: InferredChord[] = $state([]);

  function handleRawKey(event: KeyboardEvent) {
    event.preventDefault();
    keyEvent(event);
  }

  function keyEvent(event: KeyboardEvent) {
    if (event.key === "Tab") {
      clear();
    } else {
      if (replay) {
        replay = undefined;
      }
      recorder.next(event);
    }
  }

  function clear() {
    recorder = new ReplayRecorder();
  }

  function runReplay() {
    replay = recorder.finish();
  }

  function save() {
    const replay = recorder.finish();
    const blob = new Blob([JSON.stringify(replay)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "replay.json";
    a.click();
  }
</script>

<svelte:head>
  <title>Editor</title>
</svelte:head>
<svelte:window onkeydown={handleRawKey} onkeyup={handleRawKey} />

<section>
  <h2>Editor</h2>

  {#if replay}
    <div class="replay" transition:fade={{ duration: 100 }}>
      <CharRecorder {replay} cursor={true} keys={true} />
    </div>
  {/if}

  {#key recorder}
    <div
      class="editor"
      out:fade={{ duration: 100 }}
      style:opacity={replay ? 0 : undefined}
    >
      <CharRecorder replay={recorder.player} cursor={true} keys={true}>
        <TrackRollingWpm bind:wpm />
        <TrackChords bind:chords />
      </CharRecorder>
    </div>
  {/key}

  <div class="toolbar">
    <div>
      <button onclick={clear}>Clear <kbd>TAB</kbd></button>
      <button onclick={runReplay}>Replay</button>
      <button onclick={save}>Export</button>
    </div>

    <div>
      <div><b>{Math.round(wpm)}</b><sub>WPM</sub></div>
    </div>
  </div>
</section>

<style lang="scss">
  section {
    position: relative;
    width: 100%;
  }

  .replay,
  .editor {
    position: absolute;
    top: 3em;
    left: 0;
    transition: opacity 0.1s;
    padding: 16px;
    padding-bottom: 5em;
    padding-left: 0;
  }

  .toolbar {
    display: flex;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(10px);
    padding-right: 16px;

    > div {
      display: flex;
    }
  }
</style>
