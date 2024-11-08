<script lang="ts">
  let { children } = $props();
</script>

<h1><a href="/ccos">Firmware Updates</a></h1>

{@render children()}

<style lang="scss">
  h1 {
    margin-block: 1em;
    padding: 0;
    font-size: 3em;
  }
</style>
