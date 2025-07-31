<script>
  import Terminal from "$lib/components/Terminal.svelte";
</script>

<section class="terminal">
  <Terminal />
</section>

<style lang="scss">
  section {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    gap: 16px;
    contain: size;
    margin-block-end: 48px;

    width: calc(min(100%, 28cm));
    height: 100%;
    overflow: hidden;
  }
</style>
