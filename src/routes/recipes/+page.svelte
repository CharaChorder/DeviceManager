<script lang="ts">
  import Recipe from "./Recipe.svelte";

  const tests = import.meta.glob("$lib/assets/tests/**/*.yml");
</script>

<h1>Recipes</h1>

<p>These are example uses, taken directly from our E2E testing library.</p>

<div class="recipes">
  {#each Object.entries(tests) as [path, resolver]}
    {#await resolver() then module}
      <section>
        <Recipe test={module.default} />
      </section>
    {/await}
  {/each}
</div>

<style lang="scss">
  .recipes {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
  }
</style>
