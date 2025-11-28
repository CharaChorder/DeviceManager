<script lang="ts">
  import type { E2eDemo } from "$lib/meta/types/meta";
  import Recipe from "./Recipe.svelte";

  let {
    demo,
    i,
  }: {
    demo: E2eDemo;
    i: number;
  } = $props();

  let paused = $state(true);

  let config: boolean[] = $state([]);

  let test = $derived.by(() => {
    if (!demo.matrix) return demo.tests[0];

    const configuration = demo.matrix?.filter((_, i) => config[i]);
    return demo.tests.find(
      (test) => test && test.matrix?.toString() === configuration?.toString(),
    );
  });
</script>

<section
  id={"demo-" + i}
  onmouseenter={() => (paused = false)}
  onmouseleave={() => (paused = true)}
>
  {#if demo.demo}
    <h2>{demo.demo?.title}</h2>
    <p>{demo.demo?.description}</p>
  {/if}
  {#if demo.matrix}
    <div class="configuration">
      {#each demo.matrix as item, i}
        <label><input type="checkbox" bind:checked={config[i]} />{item}</label>
      {/each}
    </div>
  {/if}
  {#if test}
    <Recipe {test} {paused} />
  {/if}
</section>

<style lang="scss">
  section:target h2 {
    color: var(--md-sys-color-primary);
  }

  section {
    max-width: 20cm;
    scroll-margin-top: 80px;
  }

  section > :global(:not(h2)) {
    margin-inline-start: 24px;
  }

  .configuration {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
    margin-block: 8px;

    label {
      background-color: var(--md-sys-color-surface-variant);
      padding-inline: 8px;
      padding-block: 4px;
      height: auto;
      color: var(--md-sys-color-on-surface-variant);

      &:has(:checked) {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }

      input[type="checkbox"] {
        display: none;
      }
    }
  }
</style>
