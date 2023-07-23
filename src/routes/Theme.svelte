<script>
  import {theme} from "$lib/preferences"
</script>

<section>
  <input type="color" bind:value={$theme.color} />
  <button
    class="icon"
    on:click={() => {
      $theme.mode = $theme.mode === "light" ? "dark" : "light"
    }}
  >
    {#if $theme.mode === "light"}
      light_mode
    {:else if $theme.mode === "dark"}
      dark_mode
    {:else}
      TODO
    {/if}
  </button>
</section>

<style lang="scss">
  section {
    display: flex;
    gap: 16px;
  }

  button,
  input[type="color"] {
    cursor: pointer;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    inline-size: 24px;
    block-size: 24px;
    margin: 0;
    padding: 0;

    color: inherit;

    background: transparent;
    border: none;
    border-radius: 50%;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
    }
  }
</style>
