<script lang="ts">
  import LayoutCC1 from "$lib/components/LayoutCC1.svelte"
  import {share} from "$lib/share"
  import {getSharableUrl, parseSharableUrl} from "$lib/serial/serialization"
  import {layout} from "$lib/serial/connection"
  import type {CharaLayout} from "$lib/serial/connection"
  import tippy from "tippy.js"
  import {onMount} from "svelte"

  onMount(async () => {
    const sharedLayout = await parseSharableUrl<CharaLayout>("layout")
    if (sharedLayout) {
      $layout = sharedLayout
    }
  })

  async function shareLayout(event) {
    const data = await getSharableUrl("layout", $layout)
    await navigator.clipboard.writeText(data.toString())
    tippy(event.target, {
      content: "Share url copied!",
      hideOnClick: true,
      duration: 4000,
      onHidden(instance) {
        instance.destroy()
      },
    }).show()
  }
</script>

<svelte:window use:share={shareLayout} />

<section>
  <LayoutCC1 />
</section>

<style lang="scss">
  section {
    margin: auto;
  }
</style>
