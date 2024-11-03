<script lang="ts">
  import type { Snippet } from "svelte";
  import PageTransition from "./PageTransition.svelte";
  import Navigation from "./Navigation.svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<Navigation />

{#if children}
  <PageTransition>
    {#if children}
      {@render children()}
    {/if}
  </PageTransition>
{/if}
