<script lang="ts">
  import { fly } from "svelte/transition";
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { expoIn, expoOut } from "svelte/easing";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let inDirection = $state(0);
  let outDirection = $state(0);
  let outroEnd: undefined | (() => void) = $state(undefined);
  let animationDone: Promise<void>;

  let isNavigating = $state(false);

  const routeOrder = ["/config", "/docs", "/editor", "/chat", "/plugin"];

  function routeIndex(route: string | undefined): number {
    return routeOrder.findIndex((it) => route?.startsWith(it));
  }

  beforeNavigate((navigation) => {
    const from = routeIndex(navigation.from?.url.pathname);
    const to = routeIndex(navigation.to?.url.pathname);
    if (from === -1 || to === -1 || from === to) return;
    isNavigating = true;

    inDirection = from > to ? -1 : 1;
    outDirection = from > to ? 1 : -1;

    animationDone = new Promise((resolve) => {
      outroEnd = resolve;
    });
  });

  afterNavigate(async () => {
    await animationDone;
    isNavigating = false;
  });
</script>

{#if !isNavigating}
  <main
    in:fly={{ y: inDirection * 24, duration: 150, easing: expoOut }}
    out:fly={{ y: outDirection * 24, duration: 150, easing: expoIn }}
    onoutroend={outroEnd}
  >
    {@render children()}
  </main>
{/if}

<style lang="scss">
  main {
    padding: 0;
  }
</style>
