<script lang="ts">
  let { children } = $props();
</script>

<h1><a href="/ota-update/">Firmware Update</a></h1>

{@render children()}

<style lang="scss">
  h1 {
    margin-block: 1em;
    padding: 0;
    font-size: 3em;
    font-weight: 400;
  }
</style>
