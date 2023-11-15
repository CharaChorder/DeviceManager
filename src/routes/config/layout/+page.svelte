<script lang="ts">
  import {share} from "$lib/share"
  import tippy from "tippy.js"
  import {setContext} from "svelte"
  import Layout from "$lib/components/layout/Layout.svelte"
  import {charaFileToUriComponent} from "$lib/share/share-url"
  import SharePopup from "../SharePopup.svelte"
  import type {VisualLayoutConfig} from "$lib/components/layout/visual-layout"
  import {writable} from "svelte/store"
  import {layout} from "$lib/undo-redo"

  async function shareLayout(event: Event) {
    const url = new URL(window.location.href)
    url.searchParams.set(
      "import",
      await charaFileToUriComponent({
        charaVersion: 1,
        type: "layout",
        device: "one",
        layout: $layout.map(it => it.map(it => it.action)) as [number[], number[], number[]],
      }),
    )
    await navigator.clipboard.writeText(url.toString())
    let shareComponent: SharePopup
    tippy(event.target as HTMLElement, {
      interactive: true,
      onCreate(instance) {
        const target = instance.popper.querySelector(".tippy-content")!
        shareComponent = new SharePopup({target})
      },
      onHidden(instance) {
        instance.destroy()
      },
      onDestroy(instance) {
        shareComponent.$destroy()
      },
    }).show()
  }

  setContext<VisualLayoutConfig>("visual-layout-config", {
    scale: 50,
    inactiveScale: 0.5,
    inactiveOpacity: 0.4,
    strokeWidth: 1,
    margin: 5,
    fontSize: 9,
    iconFontSize: 14,
  })

  setContext("active-layer", writable(0))
</script>

<svelte:window use:share={shareLayout} />

<section>
  <Layout />
</section>

<style lang="scss">
  section {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
  }
</style>
