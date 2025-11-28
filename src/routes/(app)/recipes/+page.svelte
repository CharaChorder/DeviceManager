<script lang="ts">
  import { deviceMeta } from "$lib/serial/connection";
  import Demo from "./Demo.svelte";

  let recipes = $derived(
    $deviceMeta?.recipes?.toSorted((a, b) => {
      if (a.demo == null) return 1;
      if (b.demo == null) return -1;
      return a.demo.title.localeCompare(b.demo.title);
    }),
  );
</script>

<div class="page">
  <nav>
    {#each recipes as demo, i}
      {#if demo.demo?.title}
        <a href="#demo-{i}">
          {demo.demo?.title}
        </a>
      {/if}
    {/each}
  </nav>

  <div class="recipes">
    <h1>Cookbook</h1>
    {#if recipes}
      {#each recipes as demo, i}
        <Demo {demo} {i} />
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  .page {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    padding: 1rem;
    height: 100%;
  }

  .recipes {
    display: flex;
    flex-direction: column;
    gap: 60px;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  nav {
    display: flex;
    position: sticky;
    top: 1rem;
    flex-direction: column;
    align-self: flex-start;
    gap: 0.5rem;
    padding: 1rem;
    min-width: 200px;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
</style>
