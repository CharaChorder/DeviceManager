<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    onofferdropbefore,
    onofferdropafter,
    onofferreplace,
  }: {
    children: Snippet;
    onofferdropbefore: () => void;
    onofferdropafter: () => void;
    onofferreplace: () => void;
  } = $props();

  let element: HTMLSpanElement | undefined = $state(undefined);

</script>

<span
  class="droptarget"
  bind:this={element}
  {ondrop}
  {ondragenter}
  {ondragleave}
>
  {@render children()}
</span>

<style lang="scss">
  .droptarget {
    position: relative;
  }
</style>
