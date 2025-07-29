<script lang="ts">
  import { serializeActions } from "$lib/serial/chord";
  import { chords } from "$lib/undo-redo";
  import ChordEdit from "../ChordEdit.svelte";

  export function hashChord(actions: number[]) {
    const chord = new Uint8Array(16);
    const view = new DataView(chord.buffer);
    const serialized = serializeActions(actions);
    view.setBigUint64(0, serialized & 0xffff_ffff_ffff_ffffn, true);
    view.setBigUint64(8, serialized >> 64n, true);
    let hash = 2166136261;
    for (let i = 0; i < 16; i++) {
      hash = Math.imul(hash ^ view.getUint8(i), 16777619);
    }
    return hash & 0x3fff_ffff;
  }

  const broken = $derived(
    $chords.filter((it) => (hashChord(it.actions) & 0xff) === 0xff),
  );
</script>

<h1>Will my compound break</h1>
<p>
  Pre-2.2.0 there was a bug where creating a compound with specific chords as a
  base could corrupt your library.
</p>

{#if broken.length > 0}
  <p class="warning">Chords have been detected.</p>
  <p>
    If you have ever tried to create a compound chord with <b class="warning"
      >any of these as a base</b
    >, your library might have been corrupted.
  </p>
  {#each broken as chord}
    <ChordEdit {chord} onduplicate={() => {}} />
  {/each}
{:else}
  <p>No problematic chords found</p>
{/if}

<style lang="scss">
  .warning {
    color: var(--md-sys-color-error);
    font-weight: bold;
  }

  .chord {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .compound {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  p {
    max-width: 600px;
  }
</style>
