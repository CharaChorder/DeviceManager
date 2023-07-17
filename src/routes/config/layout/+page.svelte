<script lang="ts">
  import LayoutCC1 from "$lib/components/LayoutCC1.svelte"
  import {share} from "$lib/share"
  import {layout} from "$lib/serial/connection"
  import tippy from "tippy.js"
  import {onMount} from "svelte"
  import {layoutAsUrlComponent, layoutFromUrlComponent} from "$lib/serialization/layout"

  onMount(async () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has("layout")) {
      $layout = await layoutFromUrlComponent(url.searchParams.get("layout")!)
    }
  })

  async function shareLayout(event) {
    const url = new URL(window.location.href)
    url.searchParams.set("layout", await layoutAsUrlComponent($layout))
    await navigator.clipboard.writeText(url.toString())
    tippy(event.target, {
      content: "Share url copied!",
      delay: [0, 1000000],
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
