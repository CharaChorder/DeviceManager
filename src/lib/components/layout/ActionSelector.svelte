<script lang="ts">
  import {KEYMAP_CODES} from "$lib/serial/keymap-codes.js"
  import charaActions from "$lib/assets/keymaps/chara-chorder.yml"
  import mouseActions from "$lib/assets/keymaps/mouse.yml"
  import keyboardActions from "$lib/assets/keymaps/keyboard.yml"
  import asciiActions from "$lib/assets/keymaps/ascii.yml"
  import cp1252Actions from "$lib/assets/keymaps/cp-1252.yml"
  import FlexSearch from "flexsearch"

  const index = new FlexSearch({tokenize: "full"})

  for (const code in KEYMAP_CODES) {
    const key = KEYMAP_CODES[code]
    index.add(
      code,
      `${key.id || key.code} ${key.title || ""} ${key.variant || ""} ${key.description || ""}`.trim(),
    )
  }

  function search() {
    const query = searchInput.value
    customValue = query && !Number.isNaN(Number(query)) ? Number(query) : undefined
    results = query ? index.search(searchInput.value) : defaultActions
  }

  let customValue = undefined
  const defaultActions: string[] = [
    charaActions,
    mouseActions,
    keyboardActions,
    asciiActions,
    cp1252Actions,
  ].flatMap(it => Object.keys(it.actions))
  let results: string[] = defaultActions
  let searchInput: HTMLInputElement
</script>

<section>
  <input type="search" on:input={search} placeholder="Search Actions" bind:this={searchInput} />

  <div class="results">
    {#if customValue !== undefined}
      <button class="custom">
        Custom ActionID
        <span class="key">0x{customValue.toString(16).toUpperCase()}</span>
      </button>
    {/if}

    {#each results as id}
      {@const key = KEYMAP_CODES[id]}
      <button title={key.description}>
        <div class="title">
          <b>
            {key.title || ""}
            {#if key.variant === "left"}
              (Left)
            {:else if key.variant === "right"}
              (Right)
            {/if}
          </b>
          {#if key.description}
            <i>{key.description}</i>
          {/if}
        </div>
        <span class:icon={!!key.icon} class="key">{key.icon || key.id || key.code}</span>
      </button>
    {/each}
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    width: calc(min(100vw - 10px, 512px));
    height: calc(min(90vh, 600px));
  }

  input[type="search"] {
    width: 100%;
    height: 48px;
    padding-inline: 16px;

    font-family: "Noto Sans Mono", monospace;
    font-size: 18px;
    color: var(--md-sys-color-on-primary);

    background: var(--md-sys-color-primary);
    border: none;
    border-radius: 24px;

    &::placeholder {
      color: inherit;
      opacity: 0.3;
    }

    &::after {
      content: "plus";
    }
  }

  .key {
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 32px;
    height: 32px;
    padding: 4px;

    font-size: 18px;
    text-overflow: ellipsis;

    border: 1px solid var(--md-sys-color-outline);
    border-radius: 6px;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;

    text-align: start;

    > b {
      font-size: 18px;
    }
  }

  button {
    cursor: pointer;

    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    font-family: "Noto Sans Mono", monospace;
    font-size: 14px;
    color: inherit;

    background: transparent;
    border: none;
  }

  .custom {
    padding: 8px;
    padding-inline-start: 16px;
    border: 1px dashed var(--md-sys-color-outline);
    border-radius: 16px;
  }

  .results {
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: 8px;

    height: 100%;
  }
</style>
