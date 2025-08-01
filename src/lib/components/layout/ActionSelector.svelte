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
  let filter: Set<number> | undefined = $state(undefined);
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
      border: 1px solid currentcolor;
      border-radius: 6px;
      padding-inline: 4px;
      padding-block: 2px;
      height: unset;

      font-size: 14px;

      &:has(:checked) {
        background: var(--md-sys-color-secondary);
        color: var(--md-sys-color-on-secondary);
      }

      input {
        display: none;
      }
    }
  }

  dialog {
    display: flex;
    justify-content: center;
    align-items: center;

    border: none;

    background: rgba(0 0 0 / 60%);

    width: 100%;
    height: 100%;
  }

  aside {
    opacity: 0.4;

    margin: 8px;
    border: 1px dashed var(--md-sys-color-outline);
    border-radius: 8px;
    pointer-events: none;

    > h3 {
      margin-inline-start: 16px;
      margin-block-start: -13px;
      margin-block-end: 0;

      background: var(--md-sys-color-background);
      padding-inline: 8px;
      width: fit-content;
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
    align-items: center;
    gap: 4px;
    margin-inline: 16px;
  }

  .content {
    display: flex;
    position: relative;
    flex-direction: column;
    transform-origin: top left;
    border-radius: 16px;

    background: var(--md-sys-color-background);

    width: calc(min(30cm, 90%));
    height: calc(min(100% - 128px, 90%));

    overflow: hidden;

    color: var(--md-sys-color-on-background);

    @media (forced-colors: active) {
      border: 1px solid CanvasText;
    }
  }

  input[type="search"] {
    transition: all 250ms ease;
    margin-block-end: 8px;
    border: none;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);

    background: none;
    padding-inline: 16px;
    width: 100%;
    height: 64px;
    color: currentcolor;
    font-size: 16px;

    font-family: inherit;

    &:focus {
      outline: none;
      border-bottom: 1px solid var(--md-sys-color-primary);
    }
  }

  ul {
    --scrollbar-color: var(--md-sys-color-surface-variant);

    box-sizing: border-box;
    margin: 0;
    padding: 0;
    padding-inline: 4px;
    height: 100%;

    overflow-y: auto;

    scrollbar-gutter: both-edges stable;
  }

  li {
    display: contents;
  }

  .exact {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-block-start: 8px;

    border: 1px solid var(--md-sys-color-primary);
    border-radius: 8px;

    width: 100%;

    > i {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 0 0 8px 8px;

      background: var(--md-sys-color-primary);

      padding-inline: 6px;

      color: var(--md-sys-color-on-primary);
    }

    @media (forced-colors: active) {
      background: Mark;
    }
  }
</style>
