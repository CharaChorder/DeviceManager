<script lang="ts">
  import {
    KEYMAP_CATEGORIES,
    KEYMAP_CODES,
    KEYMAP_IDS,
    type KeyInfo,
  } from "$lib/serial/keymap-codes";
  import FlexSearch from "flexsearch";
  import { onMount } from "svelte";
  import ActionListItem from "$lib/components/ActionListItem.svelte";
  import LL from "$i18n/i18n-svelte";
  import { action } from "$lib/title";
  import { get } from "svelte/store";

  let {
    currentAction = undefined,
    nextAction = undefined,
    onselect,
    onclose,
  }: {
    currentAction?: number;
    nextAction?: number;
    onselect: (id: number) => void;
    onclose: () => void;
  } = $props();

  onMount(() => {
    searchBox.focus();
  });

  const index = new FlexSearch.Index({ tokenize: "full" });

  $effect(() => {
    createIndex($KEYMAP_CODES);
  });

  async function createIndex(codes: Map<number, KeyInfo>) {
    for (const [, action] of codes) {
      await index?.addAsync(
        action.code,
        `${action.title || ""} ${action.variant || ""} ${action.category} ${action.id || ""} ${
          action.description || ""
        }`,
      );
    }
  }

  async function search() {
    results = (await index!.searchAsync(searchBox.value)) as number[];
    exact = get(KEYMAP_IDS).get(searchBox.value)?.code;
    code = Number(searchBox.value);
  }

  function select(id?: number) {
    if (id !== undefined) {
      onselect(id);
    }
  }

  function keyboardNavigation(event: KeyboardEvent) {
    if (event.shiftKey && event.key === "Enter" && exact !== undefined) {
      onselect(exact);
    } else if (event.key === "ArrowDown") {
      const element =
        resultList.querySelector("li:focus-within")?.nextSibling ??
        resultList.querySelector("li:not(.exact)");
      if (element instanceof HTMLLIElement) {
        element.querySelector("button")?.focus();
      }
    } else if (event.key === "ArrowUp") {
      const element =
        resultList.querySelector("li:focus-within")?.previousSibling ??
        resultList.querySelector("li:not(.exact)");
      if (element instanceof HTMLLIElement) {
        element.querySelector("button")?.focus();
      }
    } else {
      searchBox.focus();
      return;
    }
    event.preventDefault();
  }

  let results: number[] = $state([]);
  let exact: number | undefined = $state(undefined);
  let code: number = $state(Number.NaN);

  let searchBox: HTMLInputElement;
  let resultList: HTMLUListElement;
  let filter = $state(new Set<number>());
</script>

<svelte:window on:keydown={keyboardNavigation} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  open
  onclick={(event) => {
    if (event.target === event.currentTarget) onclose();
  }}
>
  <div class="content">
    <div class="search-row">
      <input
        type="search"
        bind:this={searchBox}
        oninput={search}
        onkeypress={(event) => {
          if (event.key === "Enter") {
            select(exact);
          }
        }}
        placeholder={$LL.actionSearch.PLACEHOLDER()}
      />
      <button onclick={() => select(0)} use:action={{ shortcut: "shift+esc" }}
        >{$LL.actionSearch.DELETE()}</button
      >
      <button
        use:action={{ title: $LL.modal.CLOSE(), shortcut: "esc" }}
        class="icon"
        onclick={onclose}>close</button
      >
    </div>
    <fieldset class="filters">
      <label
        >{$LL.actionSearch.filter.ALL()}<input
          checked
          name="category"
          type="radio"
          value={undefined}
          bind:group={filter}
        /></label
      >
      {#each $KEYMAP_CATEGORIES as category}
        <label
          >{category.name}<input
            name="category"
            type="radio"
            value={new Set(Object.keys(category.actions).map(Number))}
            bind:group={filter}
          /></label
        >
      {/each}
    </fieldset>
    {#if currentAction !== undefined}
      <aside>
        <h3>{$LL.actionSearch.CURRENT_ACTION()}</h3>
        <ActionListItem id={currentAction} />
      </aside>
      {#if nextAction}
        <aside>
          <h3>{$LL.actionSearch.NEXT_ACTION()}</h3>
          <ActionListItem id={nextAction} />
        </aside>
      {/if}
    {/if}
    <ul bind:this={resultList}>
      {#if exact !== undefined}
        <li class="exact">
          <i>Exact match</i>
          <ActionListItem id={exact} onclick={() => select(exact)} />
        </li>
      {/if}
      {#if !exact && code}
        {#if code >= 2 ** 5 && code < 2 ** 13}
          <li><button onclick={() => select(code)}>USE CODE</button></li>
        {:else}
          <li>Action code is out of range</li>
        {/if}
      {/if}
      {#if filter !== undefined || results.length > 0}
        {@const resultValue =
          results.length === 0
            ? Array.from($KEYMAP_CODES, ([it]) => it)
            : results}
        {#each filter ? resultValue.filter( (it) => filter.has(it), ) : resultValue as id (id)}
          <li><ActionListItem {id} onclick={() => select(id)} /></li>
        {/each}
      {/if}
    </ul>
  </div>
</dialog>

<style lang="scss">
  .filters {
    display: flex;
    gap: 4px;
    border: none;

    label {
      height: unset;
      padding-block: 2px;
      padding-inline: 4px;

      font-size: 14px;

      border: 1px solid currentcolor;
      border-radius: 6px;

      &:has(:checked) {
        color: var(--md-sys-color-on-secondary);
        background: var(--md-sys-color-secondary);
      }

      input {
        display: none;
      }
    }
  }

  dialog {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    background: rgba(0 0 0 / 60%);

    border: none;
  }

  aside {
    pointer-events: none;

    margin: 8px;

    opacity: 0.4;
    border: 1px dashed var(--md-sys-color-outline);
    border-radius: 8px;

    > h3 {
      width: fit-content;
      margin-block-start: -13px;
      margin-block-end: 0;
      margin-inline-start: 16px;
      padding-inline: 8px;

      background: var(--md-sys-color-background);
    }

    @media (prefers-contrast: more) {
      opacity: 0.8;
    }

    @media (forced-colors: active) {
      opacity: 1;
      color: GrayText;
    }
  }

  .search-row {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-inline: 16px;
  }

  .content {
    position: relative;
    transform-origin: top left;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: calc(min(30cm, 90%));
    height: calc(min(100% - 128px, 90%));

    color: var(--md-sys-color-on-background);

    background: var(--md-sys-color-background);
    border-radius: 16px;

    @media (forced-colors: active) {
      border: 1px solid CanvasText;
    }
  }

  input[type="search"] {
    width: 100%;
    height: 64px;
    margin-block-end: 8px;
    padding-inline: 16px;

    font-family: inherit;
    font-size: 16px;
    color: currentcolor;

    background: none;
    border: none;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);

    transition: all 250ms ease;

    &:focus {
      border-bottom: 1px solid var(--md-sys-color-primary);
      outline: none;
    }
  }

  ul {
    --scrollbar-color: var(--md-sys-color-surface-variant);

    scrollbar-gutter: both-edges stable;

    overflow-y: auto;

    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0;
    padding-inline: 4px;
  }

  li {
    display: contents;
  }

  .exact {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    margin-block-start: 8px;

    border: 1px solid var(--md-sys-color-primary);
    border-radius: 8px;

    > i {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;

      padding-inline: 6px;

      color: var(--md-sys-color-on-primary);

      background: var(--md-sys-color-primary);
      border-radius: 0 0 8px 8px;
    }

    @media (forced-colors: active) {
      background: Mark;
    }
  }
</style>
