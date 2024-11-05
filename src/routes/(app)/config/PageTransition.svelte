<script lang="ts">
  import { fly } from "svelte/transition";
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { expoIn, expoOut } from "svelte/easing";
  import { type Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let inDirection = $state(0);
  let outDirection = $state(0);
  let done: undefined | (() => void) = $state(undefined);
  let animationDone: Promise<void>;

  let isNavigating = $state(false);

  const routeOrder = [
    "/config/settings/",
    "/config/chords/",
    "/config/layout/",
  ];

  function outroEnd() {
    done?.();
  }

  beforeNavigate((navigation) => {
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (from === to) return;
    isNavigating = true;

    if (!(from && to && routeOrder.includes(from) && routeOrder.includes(to))) {
      inDirection = 0;
      outDirection = 0;
    } else {
      const fromIndex = routeOrder.indexOf(from);
      const toIndex = routeOrder.indexOf(to);

      inDirection = fromIndex > toIndex ? -1 : 1;
      outDirection = fromIndex > toIndex ? 1 : -1;
    }

    animationDone = new Promise((resolve) => {
      done = resolve;
    });
  });

  afterNavigate(async () => {
    await animationDone;
    isNavigating = false;
  });
</script>

{#if !isNavigating}
  <main
    in:fly={{
      y: inDirection * 24,
      duration: 150,
      delay: 1, // flicker for some reason without this
      easing: expoOut,
    }}
    out:fly={{ y: outDirection * 24, duration: 150, easing: expoIn }}
    onoutroend={outroEnd}
  >
    {@render children()}
  </main>
{/if}

<style lang="scss">
  main {
    padding: 0;
    width: 100%;
  }
</style>
