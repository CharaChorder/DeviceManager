<script lang="ts">
  import {share} from "$lib/share"
  import {layout} from "$lib/serial/connection"
  import tippy from "tippy.js"
  import {onMount} from "svelte"
  import {layoutAsUrlComponent, layoutFromUrlComponent} from "$lib/serialization/layout"
  import Layout from "$lib/components/layout/Layout.svelte"

  onMount(async () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has("layout")) {
      $layout = await layoutFromUrlComponent(url.searchParams.get("layout")!)
    }
  })

  async function shareLayout(event: Event) {
    const url = new URL(window.location.href)
    url.searchParams.set("layout", await layoutAsUrlComponent($layout))
    await navigator.clipboard.writeText(url.toString())
    tippy(event.target as HTMLElement, {
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
  <Layout />
</section>

<style lang="scss">
  section {
    margin: auto;
  }
</style>
