<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  $effect(() => {
    console.log(data);
  });
</script>

<details>
  <summary>Full Log</summary>
  {#each data.data as item, i}
    {#if "press" in item}
      <div class="press">{item.press}</div>
    {:else if "release" in item}
      <div class="release">{item.release}</div>
    {:else if "keys" in item}
      <div class="report">
        <span class="icon">keyboard</span>
        <div class="modifiers">
          {item.modifiers.toString(2)}
        </div>
        <div class="keys">{item.keys.join(", ")}</div>
      </div>
    {:else if "out" in item}
      <pre class="out">{item.out}</pre>
    {:else if "in" in item}
      <pre class="in">{item.in}</pre>
    {:else if "tick" in item}
      <div class="tick"><span class="icon">timer_play</span>{item.tick}ms</div>
    {:else}
      <div>Unknown log item at index {i}</div>
    {/if}
  {/each}
</details>

<style lang="scss">
  details {
    margin-top: 1rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.5rem;
    background-color: var(--md-sys-color-surface-variant);
    padding: 1rem;
  }

  .report {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--md-sys-color-primary-container);
    padding: 0.5rem;
    color: var(--md-sys-color-on-primary-container);
  }

  .out {
    color: var(--md-sys-color-primary);
  }

  .in {
    color: var(--md-sys-color-secondary);
  }

  .tick {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;
    padding: 0.2rem 0.5rem;
    width: fit-content;
    color: var(--md-sys-color-tertiary);
    font-size: 0.6rem;
  }

  .icon {
    font-size: inherit;
  }

  input[type="range"] {
    margin-bottom: 1rem;
    width: 100%;
  }
</style>
