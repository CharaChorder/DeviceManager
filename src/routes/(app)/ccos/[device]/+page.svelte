<script lang="ts">
  let { data } = $props();

  let showPrerelease = $state(false);
</script>

<div class="title">
  <h2>Versions available for <em>{data.device}</em></h2>
  <label
    >Include Pre-releases<input
      type="checkbox"
      bind:checked={showPrerelease}
    /></label
  >
</div>

{#if data.versions}
  <ul>
    {#each data.versions as version}
      {@const isPrerelease = version.name.includes("-")}
      <li class:pre-release={isPrerelease}>
        <a href="./{version.name}/">{version.name}</a>
      </li>
    {/each}
  </ul>
{:else}
  <h2>The device {data.device} does not exist.</h2>
{/if}

<style lang="scss">
  .pre-release {
    margin-inline-start: 2em;
  }

  ul {
    padding: 0;
    list-style: none;
  }

  li {
    transition:
      height 200ms ease,
      opacity 200ms ease;
    height: 2em;
    overflow: hidden;
  }

  label {
    opacity: 0.6;
    padding: 0;
  }

  .title {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    h2 {
      margin-block-end: 0;

      em {
        color: var(--md-sys-color-primary);
        font-style: normal;
      }
    }
  }

  div.title:has(input:not(:checked)) ~ ul .pre-release {
    opacity: 0;
    height: 0;
  }
</style>
