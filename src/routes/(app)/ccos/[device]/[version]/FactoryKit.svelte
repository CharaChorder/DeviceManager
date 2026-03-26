<script lang="ts">
  import ProgressButton from "$lib/ProgressButton.svelte";
  import {
    assembleFactoryKit,
    type VersionMetaWithEsptool,
  } from "./factory-kit";

  let { meta }: { meta: VersionMetaWithEsptool } = $props();

  const osChoices = ["Windows", "Linux", "MacOS"] as const;
  let os: (typeof osChoices)[number] = $state(osChoices[0]);

  let working = $state(false);
  let progress = $state(0);
  let error: string | undefined = $state(undefined);

  async function download() {
    progress = 0;
    error = undefined;
    working = true;
    try {
      const result = await assembleFactoryKit(meta, os, (value) => {
        progress = value;
      });
      const url = URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factory-kit-${meta.device}-${meta.version}-${os}.zip`;
      a.click();
    } catch (err) {
      error = (err as Error).message;
    } finally {
      working = false;
    }
  }
</script>

<section>
  <h3><span class="icon">factory</span> Factory Kit</h3>
  <div class="os-selection">
    {#each osChoices as value}
      <label
        ><input type="radio" name="os" {value} bind:group={os} />{value}</label
      >
    {/each}
  </div>
  <ProgressButton onclick={download} {progress} {working} {error}
    ><span class="icon">download</span> Download</ProgressButton
  >
</section>

<style lang="scss">
  .os-selection {
    display: flex;
    gap: 2px;
    margin: 16px 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
