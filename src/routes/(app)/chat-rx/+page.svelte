<script lang="ts">
  import { initMatrixClient, isLoggedIn, matrix } from "$lib/chat/chat-rx";
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import Login from "./Login.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  onMount(async () => {
    if (browser) {
      await initMatrixClient();
    }
  });

  let { children } = $props();

  let spaces = $derived($matrix?.topLevelSpaces$);

  function spaceShort(name: string) {
    return name
      .split(" ")
      .map((it) => it[0])
      .join("");
  }
</script>

{#if $isLoggedIn}
  <div class="layout">
    <nav class="spaces">
      <a href="/chat/chats" class="icon chats">chat</a>
      <hr />
      {#if $spaces}
        <ul>
          {#each $spaces as space (space.roomId)}
            <li animate:flip transition:slide>
              <a class="space" href="/chat/space/{space.roomId}">
                {spaceShort(space.name)}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
      <button class="icon">add</button>
    </nav>
  </div>
{:else}
  <Login />
{/if}

<style lang="scss">
  nav {
    display: flex;
    flex-direction: column;
  }

  .layout {
    display: flex;
    width: 100%;
    height: 100%;
  }

  hr {
    width: 60%;
    height: 1px;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button,
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--md-sys-color-surface-variant);
    width: 56px;
    height: 56px;
    overflow: hidden;
  }

  .chats {
    font-size: 24px;
  }

  .space {
    margin-bottom: 8px;
    font-size: 20px;
  }
</style>
