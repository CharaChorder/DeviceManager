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
  import type { KeymapCategory } from "$lib/meta/types/actions";
  import Action from "../Action.svelte";
  import { isVerbose } from "../verbose-action";
  import { actionToValue } from "$lib/chord-editor/action-serializer";

  let {
    currentAction = undefined,
    nextAction = undefined,
    autofocus = false,
    onselect,
    onclose,
  }: {
    currentAction?: number;
    nextAction?: number;
    autofocus?: boolean;
    onselect: (id: number) => void;
    onclose?: () => void;
  } = $props();

  onMount(() => {
    search();
    if (autofocus) {
      searchBox.focus();
    }
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
    const groups = new Map(
      $KEYMAP_CATEGORIES.map(
        (category) => [category, []] as [KeymapCategory, KeyInfo[]],
      ),
    );
    const result =
      searchBox.value === ""
        ? Array.from($KEYMAP_CODES.keys())
        : await index!.searchAsync(searchBox.value);
    for (const id of result) {
      const action = $KEYMAP_CODES.get(id as number);
      if (action?.category) {
        groups.get(action.category)?.push(action);
      }
    }

    function sortValue(action: KeyInfo): number {
      return isVerbose(action) ? 0 : action.id?.length === 1 ? 2 : 1;
    }
    for (const actions of groups.values()) {
      actions.sort((a, b) => sortValue(b) - sortValue(a));
    }
    results = groups;
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

  let results: Map<KeymapCategory, KeyInfo[]> = $state(new Map());
  let exact: number | undefined = $state(undefined);
  let code: number = $state(Number.NaN);

  let searchBox: HTMLInputElement;
  let resultList: HTMLUListElement;
</script>

<div class="content">
  <div class="search-row">
    <!-- svelte-ignore a11y_autofocus -->
    <input
      type="search"
      bind:this={searchBox}
      oninput={search}
      onkeypress={keyboardNavigation}
      placeholder={$LL.actionSearch.PLACEHOLDER()}
    />
    {#if onclose}
      <button onclick={() => select(0)} use:action={{ shortcut: "shift+esc" }}
        >{$LL.actionSearch.DELETE()}</button
      >
      <button
        use:action={{ title: $LL.modal.CLOSE(), shortcut: "esc" }}
        class="icon"
        onclick={onclose}>close</button
      >
    {/if}
  </div>
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
    {#each results as [category, actions] (category)}
      {#if actions.length > 0}
        <div class="category">
          <h3>{category.name}</h3>
          <div class="description">{category.description}</div>
          <ul>
            {#each actions as action (action.code)}
              <button
                class="action-item"
                draggable="true"
                onclick={() => select(action.code)}
                ondragstart={onselect === undefined
                  ? (event) => {
                      if (!event.dataTransfer) return;
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = "copy";
                      event.dataTransfer.clearData();
                      event.dataTransfer.setData(
                        "text/plain",
                        actionToValue(action.code),
                      );
                    }
                  : undefined}
              >
                <Action {action} display="verbose"></Action>
              </button>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}
  </ul>
</div>

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

  .action-item {
    cursor: grab;
    margin: 0;
    padding: 0;
    height: auto;
    font: inherit;
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

  .category {
    .description {
      opacity: 0.8;
      margin-block-start: -16px;
      font-style: italic;
      font-size: 14px;
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-block: 24px;
      overflow: hidden;
    }
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
