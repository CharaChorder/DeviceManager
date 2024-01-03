<script lang="ts">
  import "$lib/fonts/noto-sans-mono.scss"
  import "$lib/fonts/material-symbols-rounded.scss"
  import "$lib/style/scrollbar.scss"
  import "$lib/style/tippy.scss"
  import "$lib/style/theme.scss"
  import {onDestroy, onMount} from "svelte"
  import {applyTheme, argbFromHex, themeFromSourceColor} from "@material/material-color-utilities"
  import Navigation from "./Navigation.svelte"
  import {canAutoConnect} from "$lib/serial/device"
  import {initSerial} from "$lib/serial/connection"
  import type {LayoutData} from "./$types"
  import {browser} from "$app/environment"
  import BrowserWarning from "./BrowserWarning.svelte"
  import "tippy.js/animations/shift-away.css"
  import "tippy.js/dist/tippy.css"
  import tippy from "tippy.js"
  import {theme, userPreferences} from "$lib/preferences.js"
  import {LL, setLocale} from "../i18n/i18n-svelte"
  import {loadLocale} from "../i18n/i18n-util.sync"
  import {detectLocale} from "../i18n/i18n-util"
  import type {Locales} from "../i18n/i18n-types"
  import Footer from "./Footer.svelte"
  import {runLayoutDetection} from "$lib/os-layout.js"
  import PageTransition from "./PageTransition.svelte"
  import {restoreFromFile} from "$lib/backup/backup"
  import {goto} from "$app/navigation"

  const locale = ((browser && localStorage.getItem("locale")) as Locales) || detectLocale()
  loadLocale(locale)
  setLocale(locale)
  let stopLayoutDetection: () => void

  if (browser) {
    stopLayoutDetection = runLayoutDetection()
    tippy.setDefaultProps({
      animation: "shift-away",
      theme: "surface-variant",
      allowHTML: true,
      duration: 250,
      maxWidth: "none",
      arrow: true,
    })
  }

  export let data: LayoutData

  onMount(async () => {
    theme.subscribe(it => {
      const theme = themeFromSourceColor(argbFromHex(it.color))
      const dark = it.mode === "dark" // window.matchMedia("(prefers-color-scheme: dark)").matches
      applyTheme(theme, {target: document.body, dark})
    })
    if (import.meta.env.TAURI_FAMILY === undefined) {
      const {initPwa} = await import("./pwa-setup")
      webManifestLink = await initPwa()
    }

    if (browser && $userPreferences.autoConnect && (await canAutoConnect())) {
      await initSerial()
    }
    if (data.importFile) {
      restoreFromFile(data.importFile)
      const url = new URL(location.href)
      url.searchParams.delete("import")
      await goto(url.href, {replaceState: true})
    }
  })

  onDestroy(() => {
    stopLayoutDetection?.()
  })

  let webManifestLink = ""
</script>

<svelte:head>
  {@html webManifestLink}
  <title>{$LL.TITLE()}</title>
  <meta name="description" content={$LL.DESCRIPTION()} />
  <meta name="theme-color" content={data.themeColor} />
</svelte:head>

<Navigation />

<!-- <PickChangesDialog /> -->

<PageTransition>
  <slot />
</PageTransition>

<Footer />

{#if import.meta.env.TAURI_FAMILY === undefined && browser && !("serial" in navigator)}
  <BrowserWarning />
{/if}

<style lang="scss" global>
  body {
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 100vw;
    height: 100vh;
    margin: 0;

    font-family: "Noto Sans Mono", monospace;
    color: var(--md-sys-color-on-background);

    background: var(--md-sys-color-background);
  }

  main {
    contain: strict;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    padding-inline: 16px;
  }

  h1 {
    margin-block-start: 0;
    font-size: 4rem;
    font-weight: 700;
    color: var(--md-sys-color-secondary);
  }
</style>
