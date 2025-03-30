<script lang="ts">
  import { slide } from 'svelte/transition';

  // Define the type for the chord prop
  type ChordProps = {
    deleted: boolean;
    isApplied: boolean;
  };

  // Use the type with $props
  const { chord = { deleted: false, isApplied: false } } = $props<{
    chord?: ChordProps;
  }>();

  // TODO: Implement deletion functionality
  function remove() {
    // Implement chord deletion logic
  }

  // TODO: Implement restore functionality (used for both trash restoration and undo)
  function restore() {
    // Implement chord restoration logic
  }

  // TODO: Implement duplication functionality
  function duplicate() {
    // Implement chord duplication logic
  }

  // TODO: Implement sharing functionality
  function share() {
    // Implement chord sharing logic
  }
</script>

<div class="table-buttons">
  {#if !chord['deleted']}
    <button transition:slide class="icon compact" onclick={remove}
      >delete</button
    >
  {:else}
    <button transition:slide class="icon compact" onclick={restore}
      >restore_from_trash</button
    >
  {/if}
  <button disabled={chord['deleted']} class="icon compact" onclick={duplicate}
    >content_copy</button
  >
  <button
    class="icon compact"
    class:disabled={chord['isApplied']}
    onclick={restore}>undo</button
  >
  <div class="separator"></div>
  <button class="icon compact" onclick={share}>share</button>
</div>
