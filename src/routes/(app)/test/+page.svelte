<script lang="ts">
  import AnimatedNumber from "$lib/components/AnimatedNumber.svelte";
  import { onDestroy, onMount } from "svelte";

  let interval: ReturnType<typeof setInterval>;

  let value = $state(Math.round(Math.random() * 100));

  onMount(() => {
    interval = setInterval(() => {
      value = Math.round(Math.random() * 100);
    }, 2000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<p>The number is <AnimatedNumber {value} /></p>
