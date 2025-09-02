<script lang="ts">
  import { deviceMeta, serialPort } from "$lib/serial/connection";
  import { action } from "$lib/title";
  import GenericLayout from "$lib/components/layout/GenericLayout.svelte";
  import { activeProfile, activeLayer } from "$lib/serial/connection";
  import type { VisualLayout } from "$lib/serialization/visual-layout";
  import { fade, fly } from "svelte/transition";
  import { restoreFromFile } from "$lib/backup/backup";

  const layouts = {
    ONE: () =>
      import("$lib/assets/layouts/one.yml").then(
        (it) => it.default as VisualLayout,
      ),
    TWO: () =>
      import("$lib/assets/layouts/one.yml").then(
        (it) => it.default as VisualLayout,
      ),
    LITE: () =>
      import("$lib/assets/layouts/lite.yml").then(
        (it) => it.default as VisualLayout,
      ),
    X: () =>
      import("$lib/assets/layouts/generic/103-key.yml").then(
        (it) => it.default as VisualLayout,
      ),
    M4G: () =>
      import("$lib/assets/layouts/m4g.yml").then(
        (it) => it.default as VisualLayout,
      ),
    M4GR: () =>
      import("$lib/assets/layouts/m4gr.yml").then(
        (it) => it.default as VisualLayout,
      ),
    T4G: () =>
      import("$lib/assets/layouts/t4g.yml").then(
        (it) => it.default as VisualLayout,
      ),
  };
</script>

<div class="container">
  {#if $serialPort}
    {#await layouts[$serialPort.device]() then visualLayout}
      <fieldset transition:fade>
        <div class="layers">
          {#each Array.from({ length: $serialPort.layerCount }, (_, i) => i) as layer}
            <label>
              <input
                type="radio"
                onclick={() => ($activeLayer = layer)}
                name="layer"
                value={layer}
                checked={$activeLayer === layer}
              />
              {String.fromCodePoint(
                "A".codePointAt(0)! + $activeProfile,
              )}{layer + 1}
            </label>
          {/each}
        </div>
        {#if $deviceMeta?.factoryDefaults?.layout}
          <button
            use:action={{ title: "Reset Layout" }}
            transition:fly={{ x: -8 }}
            class="icon reset-layout"
            onclick={() =>
              restoreFromFile($deviceMeta!.factoryDefaults!.layout)}
            >reset_wrench</button
          >
        {/if}
      </fieldset>

      <GenericLayout {visualLayout} />
    {/await}
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    max-height: 20cm;
  }

  fieldset {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;

    border: none;

    padding: 8px;
  }

  .layers {
    display: flex;
    justify-content: center;
    align-items: center;

    gap: 2px;

    margin-inline: auto;
  }
</style>
