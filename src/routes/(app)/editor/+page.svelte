<script lang="ts">
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import type { InferredChord, Replay } from "$lib/charrecorder/core/types";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import TrackChords from "$lib/charrecorder/TrackChords.svelte";
  import TrackRollingWpm from "$lib/charrecorder/TrackRollingWpm.svelte";
  import { fade } from "svelte/transition";
  import { initSerial, serialPort } from "$lib/serial/connection";
  import { tick } from "svelte";
  import { ccosKeyInterceptor } from "$lib/ccos/attachment";

  let recorder: ReplayRecorder = $state(new ReplayRecorder());
  let replay: Replay | undefined = $state();

  let wpm = $state(0);
  let cc0Loading = $state(false);
  let chords: InferredChord[] = $state([]);

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

  async function connectCC0(event: MouseEvent) {
    cc0Loading = true;
    try {
      await tick();
      if ($serialPort) {
        $serialPort?.close();
        $serialPort = undefined;
      }
      const { fetchCCOS } = await import("$lib/ccos/ccos");
      const ccos = await fetchCCOS();
      if (ccos) {
        try {
          await initSerial(ccos, !event.shiftKey);
        } catch (error) {
          console.error(error);
        }
      }
    } finally {
      cc0Loading = false;
    }
  }
</script>

<svelte:head>
  <title>Editor</title>
</svelte:head>

<section>
  <h2>
    CCOS Emulator
    {#if $serialPort?.chipset === "WASM"}
      <small>(Emulator Active)</small>
    {:else}
      <button class="primary" disabled={cc0Loading} onclick={connectCC0}>
        <span class="icon">play_arrow</span>
        Boot CCOS Emulator</button
      >
    {/if}
  </h2>

  <p style:max-width="600px">
    Try a (limited) demo of CCOS running directly in your browser.<br /><span
      style:color="var(--md-sys-color-primary)"
      >Chording requires an <b>NKRO Keyboard</b> to work properly.</span
    >
    <br />Browsers usually report key timings with limited accuracy to revent
    fingerprinting, which can impact chording.
    <br /><i>Results may vary.</i>
    <br />
    Use sidebar tabs to configure <a href="/config/chords/">Chords</a>,
    <a href="/config/layout/">Layout</a>
    and <a href="/config/settings/">Settings</a>.
  </p>

  {#if replay}
    <div class="replay" transition:fade={{ duration: 100 }}>
      <CharRecorder {replay} cursor={true} keys={true} />
    </div>
  {/if}

  {#key recorder}
    <div
      class="editor"
      tabindex="-1"
      out:fade={{ duration: 100 }}
      {@attach ccosKeyInterceptor($serialPort, recorder)}
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

  a {
    display: inline;
    padding: 0;
    color: var(--md-sys-color-primary);
  }

  small {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--md-sys-color-primary);
    font-weight: 500;
    font-size: 0.6em;
  }

  button.primary {
    display: inline-flex;
    background: none;
    color: var(--md-sys-color-primary);
  }

  .replay,
  .editor {
    transition: opacity 0.1s;
    margin: 4px;
    outline: 1px solid var(--md-sys-color-outline);
    padding: 16px;
    padding-bottom: 5em;

    &:focus-within {
      outline: 2px solid var(--md-sys-color-primary);
    }
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
