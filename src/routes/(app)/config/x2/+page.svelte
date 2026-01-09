<script>
  import { parseCharaChords } from "$lib/chord-editor/action-serializer";
  import text from "$lib/chord-editor/test.txt?raw";
  import { KEYMAP_IDS } from "$lib/serial/keymap-codes";
</script>

<pre>{text}</pre>
{#each parseCharaChords(text, $KEYMAP_IDS) as chord}
  <pre>{JSON.stringify(chord)} ({text.slice(chord.from, chord.to)})</pre>
{/each}
