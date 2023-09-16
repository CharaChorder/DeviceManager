<script lang="ts">
  import {share} from "$lib/share"
  import {layout} from "$lib/serial/connection"
  import tippy from "tippy.js"
  import {onMount} from "svelte"
  import Layout from "$lib/components/layout/Layout.svelte"
  import {csvLayoutToJson, isCsvLayout} from "$lib/compat/legacy-layout"
  import {charaFileFromUriComponent, charaFileToUriComponent} from "$lib/share/share-url"
  import type {CharaLayoutFile} from "$lib/share/chara-file"
  import SharePopup from "../SharePopup.svelte"

  onMount(async () => {
    const url = new URL(window.location.href)
    if (url.searchParams.has("import")) {
      const file = await charaFileFromUriComponent(url.searchParams.get("import")!)
      if (file.type === "layout") {
        $layout = file.layout
      }
    }
  })

  async function shareLayout(event: Event) {
    const url = new URL(window.location.href)
    url.searchParams.set(
      "import",
      await charaFileToUriComponent({
        charaVersion: 1,
        type: "layout",
        device: "one",
        layout: $layout,
      }),
    )
    await navigator.clipboard.writeText(url.toString())
    let shareComponent: SharePopup
    tippy(event.target as HTMLElement, {
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

  async function importLayout() {
    const file = await fileInput.files?.item(0)?.text()
    if (!file) return
    const importedLayout = isCsvLayout(file) ? csvLayoutToJson(file) : (JSON.parse(file) as CharaLayoutFile)
    if (importedLayout.type === "layout" && importedLayout.charaVersion === 1) $layout = importedLayout.layout
  }

  let fileInput: HTMLInputElement
</script>

<svelte:window use:share={shareLayout} />

<section>
  <label class="icon"
    >upload_file<input
      bind:this={fileInput}
      on:input={importLayout}
      type="file"
      accept="text/csv, application/json"
    /></label
  >
  <Layout />
</section>

<style lang="scss">
  section {
    margin: auto;
  }

  input[type="file"] {
    display: none;
  }
</style>
