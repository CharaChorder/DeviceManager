<script lang="ts">
  import { isLoggedIn, matrix } from "$lib/chat/chat";
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import Login from "./Login.svelte";

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
    height: 100%;
    width: 100%;
  }

  hr {
    width: 60%;
    height: 1px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  button,
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 56px;
    height: 56px;
    background: var(--md-sys-color-surface-variant);
  }

  .chats {
    font-size: 24px;
  }

  .space {
    font-size: 20px;
    margin-bottom: 8px;
  }
</style>
