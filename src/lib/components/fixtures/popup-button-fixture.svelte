<script lang="ts">
  import { popup } from "$lib/popup";
  import PopupContentFixture from "./popup-content-fixture.svelte";
</script>

<button use:popup={PopupContentFixture}>Open popup</button>
