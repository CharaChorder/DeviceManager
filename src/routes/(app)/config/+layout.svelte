<script lang="ts">
    import type { Snippet } from "svelte";
  import Navigation from "./Navigation.svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<Navigation />

{#if children}
  {@render children()}
{/if}
