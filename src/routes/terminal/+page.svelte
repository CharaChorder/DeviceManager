<script>
  import Terminal from "$lib/components/Terminal.svelte"
</script>

<section class="terminal">
  <Terminal />
</section>

<style lang="scss">
  section {
    contain: size;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 16px;

    width: calc(min(100%, 28cm));
    height: 100%;
    margin-block-end: 48px;
  }
</style>
