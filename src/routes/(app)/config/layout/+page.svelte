<script lang="ts">
  import { share } from "$lib/share";
  import tippy from "tippy.js";
  import { mount, setContext, unmount } from "svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { charaFileToUriComponent } from "$lib/share/share-url";
  import SharePopup from "../SharePopup.svelte";
  import type { VisualLayoutConfig } from "$lib/components/layout/visual-layout";
  import { layout } from "$lib/undo-redo";

  async function shareLayout(event: Event) {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "import",
      await charaFileToUriComponent({
        charaVersion: 1,
        type: "layout",
        device: "one",
        layout: $layout.map((it) => it.map((it) => it.action)) as [
          number[],
          number[],
          number[],
        ],
      }),
    );
    await navigator.clipboard.writeText(url.toString());
    let shareComponent: {};
    tippy(event.target as HTMLElement, {
      onCreate(instance) {
        const target = instance.popper.querySelector(".tippy-content")!;
        shareComponent = mount(SharePopup, { target });
      },
      onHidden(instance) {
        instance.destroy();
      },
      onDestroy() {
        unmount(shareComponent);
      },
    }).show();
  }

  setContext<VisualLayoutConfig>("visual-layout-config", {
    scale: 50,
    inactiveScale: 0.5,
    inactiveOpacity: 0.4,
    strokeWidth: 1,
    margin: 5,
    fontSize: 9,
    iconFontSize: 14,
  });
</script>

<svelte:head>
  <title>Layout Manager - CharaChorder Device Manager</title>
  <meta name="description" content="Edit your layout" />
</svelte:head>

<svelte:window use:share={shareLayout} />

<section>
  <Layout />
</section>

<style lang="scss">
  section {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
  }
</style>
