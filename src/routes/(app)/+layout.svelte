<script lang="ts">
  import "$lib/fonts/noto-sans-mono.scss";
  import "$lib/fonts/material-symbols-rounded.scss";
  import "$lib/style/scrollbar.scss";
  import "$lib/style/tippy.scss";
  import "$lib/style/theme.scss";
  import Sidebar from "./Sidebar.svelte";
  import { onDestroy, onMount, type Snippet } from "svelte";
  import {
    applyTheme,
    argbFromHex,
    themeFromSourceColor,
  } from "@material/material-color-utilities";
  import { canAutoConnect } from "$lib/serial/device";
  import { initSerial } from "$lib/serial/connection";
  import type { LayoutData } from "./$types";
  import { browser } from "$app/environment";
  import "tippy.js/animations/shift-away.css";
  import "tippy.js/dist/tippy.css";
  import tippy from "tippy.js";
  import { theme, userPreferences } from "$lib/preferences.js";
  import { LL, setLocale } from "$i18n/i18n-svelte";
  import { loadLocale } from "$i18n/i18n-util.sync";
  import { detectLocale } from "$i18n/i18n-util";
  import type { Locales } from "$i18n/i18n-types";
  import Footer from "./Footer.svelte";
  import { osLayout, runLayoutDetection } from "$lib/os-layout.js";
  import PageTransition from "./PageTransition.svelte";
  import { restoreFromFile } from "$lib/backup/backup";
  import { goto } from "$app/navigation";
  import { hotkeys } from "$lib/title";

  const locale =
    ((browser && localStorage.getItem("locale")) as Locales) || detectLocale();
  loadLocale(locale);
  setLocale(locale);
  let stopLayoutDetection: () => void;

  if (browser) {
    stopLayoutDetection = runLayoutDetection();
    tippy.setDefaultProps({
      animation: "shift-away",
      theme: "surface-variant",
      allowHTML: true,
      duration: 250,
      maxWidth: "none",
      arrow: true,
    });
  }

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  onMount(async () => {
    theme.subscribe((it) => {
      const theme = themeFromSourceColor(argbFromHex(it.color));
      const dark = it.mode === "dark"; // window.matchMedia("(prefers-color-scheme: dark)").matches
      applyTheme(theme, { target: document.body, dark });
    });

    if (import.meta.env.TAURI_FAMILY === undefined) {
      const { initPwa } = await import("./pwa-setup");
      webManifestLink = await initPwa();
    }

    if (browser && $userPreferences.autoConnect && (await canAutoConnect())) {
      await initSerial();
    }

    if (data.importFile) {
      restoreFromFile(data.importFile);
      const url = new URL(location.href);
      url.searchParams.delete("import");
      await goto(url.href, { replaceState: true });
    }
  });

  onDestroy(() => {
    stopLayoutDetection?.();
  });

  let webManifestLink = $state("");

  function handleHotkey(event: KeyboardEvent) {
    let key = $osLayout.get(event.code);
    if (!key && event.code === "Escape") key = "esc";
    if (!key && event.code === "ArrowLeft") key = "left";
    if (!key && event.code === "ArrowRight") key = "right";
    if (!key && event.code === "ArrowUp") key = "up";
    if (!key && event.code === "ArrowDown") key = "down";

    if (!key) return;
    const str = [
      event.ctrlKey ? "ctrl" : undefined,
      event.shiftKey ? "shift" : undefined,
      event.altKey ? "alt" : undefined,
      key,
    ]
      .filter((it) => !!it)
      .join("+");

    const node = hotkeys.get(str);
    if (node) {
      event.preventDefault();
      node.click();
    }
  }
</script>

<svelte:head>
  {@html webManifestLink}
  <title>{$LL.TITLE()}</title>
  <meta name="description" content={$LL.DESCRIPTION()} />
  <meta name="theme-color" content={data.themeColor} />
</svelte:head>

<svelte:window onkeydown={handleHotkey} />

<div class="layout">
  <Sidebar />

  <!-- <PickChangesDialog /> -->

  <PageTransition>
    {#if children}
      {@render children()}
    {/if}
  </PageTransition>

  <Footer />
</div>

<style lang="scss">
  .layout {
    width: 100vw;
    height: 100vh;

    display: grid;
    grid-template-areas:
      "sidebar main"
      "sidebar footer";
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;
  }
</style>
