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
        <a href="./{version.name}/"
          >{version.name}
          <time datetime={version.mtime}
            >{new Date(version.mtime).toLocaleDateString()}</time
          ></a
        >
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
    list-style: none;
    padding: 0;
  }

  li {
    height: 2em;
    overflow: hidden;
    transition:
      height 200ms ease,
      opacity 200ms ease;
  }

  label {
    padding: 0;
    opacity: 0.6;
  }

  .title {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    h2 {
      margin-block-end: 0;

      em {
        font-style: normal;
        color: var(--md-sys-color-primary);
      }
    }
  }

  time {
    opacity: 0.5;
    &:before {
      content: "•";
      padding-inline: 0.4ch;
    }
  }

  div.title:has(input:not(:checked)) ~ ul .pre-release {
    height: 0;
    opacity: 0;
  }
</style>
