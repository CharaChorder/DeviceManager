<div class="table-buttons">
  {#if !chord.deleted}
    <button transition:slide class="icon compact" onclick={remove}
      >delete</button
    >
  {:else}
    <button transition:slide class="icon compact" onclick={restore}
      >restore_from_trash</button
    >
  {/if}
  <button disabled={chord.deleted} class="icon compact" onclick={duplicate}
    >content_copy</button
  >
  <button
    class="icon compact"
    class:disabled={chord.isApplied}
    onclick={restore}>undo</button
  >
  <div class="separator"></div>
  <button class="icon compact" onclick={share}>share</button>
</div>
