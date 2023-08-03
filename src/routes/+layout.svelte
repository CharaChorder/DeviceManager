<script lang="ts">
  import "$lib/fonts/noto-sans-mono.scss"
  import "$lib/fonts/material-symbols-rounded.scss"
  import "$lib/style/scrollbar.scss"
  import "$lib/style/tippy.scss"
  import "$lib/style/toggle.scss"
  import {onMount} from "svelte"
  import {applyTheme, argbFromHex, themeFromSourceColor} from "@material/material-color-utilities"
  import Navigation from "./Navigation.svelte"
  import {canAutoConnect} from "$lib/serial/device"
  import {initSerial} from "$lib/serial/connection"
  import type {LayoutServerData} from "./$types"
  import {browser} from "$app/environment"
  import BrowserWarning from "./BrowserWarning.svelte"
  import "tippy.js/animations/shift-away.css"
  import "tippy.js/dist/tippy.css"
  import tippy from "tippy.js"
  import {theme, userPreferences} from "$lib/preferences.js"
  import {setLocale} from "../i18n/i18n-svelte"
  import {loadLocale} from "../i18n/i18n-util.sync"
  import {detectLocale} from "../i18n/i18n-util"
  import type {Locales} from "../i18n/i18n-types"

  const locale = ((browser && localStorage.getItem("locale")) as Locales) || detectLocale()
  loadLocale(locale)
  setLocale(locale)

  if (browser) {
    tippy.setDefaultProps({
      animation: "shift-away",
      theme: "surface-variant",
      allowHTML: true,
      duration: 250,
      maxWidth: "none",
      arrow: true,
    })
  }

  export let data: LayoutServerData

  onMount(async () => {
    theme.subscribe(it => {
      const theme = themeFromSourceColor(argbFromHex(it.color))
      const dark = it.mode === "dark" // window.matchMedia("(prefers-color-scheme: dark)").matches
      applyTheme(theme, {target: document.body, dark})
    })
    if (import.meta.env.TAURI_FAMILY === undefined) {
      const {initPwa} = await import("./pwa-setup")
      await initPwa()
    }

    if (browser && $userPreferences.autoConnect && (await canAutoConnect())) await initSerial()
  })

  let webManifestLink = ""
</script>

<svelte:head>
  {@html webManifestLink}
  <title>amaCC1ng</title>
  <meta name="description" content="Tool for CharaChorder devices" />
  <meta name="theme-color" content={data.themeColor} />
</svelte:head>

<Navigation />

<main>
  <slot />
</main>

{#if import.meta.env.TAURI_FAMILY === undefined && browser && !("serial" in navigator)}
  <BrowserWarning />
{/if}

<style lang="scss" global>
  * {
    box-sizing: border-box;
    appearance: none;
  }

  a {
    color: var(--md-sys-color-tertiary);
  }

  label:has(input):hover,
  .button:hover:not(:active),
  a:hover:not(:active),
  button:hover:not(:active) {
    filter: brightness(70%);
    transition: filter 250ms ease;

    &:has(:checked),
    &.active {
      filter: brightness(120%);
    }

    &:disabled,
    &.disabled {
      opacity: 0.5;
      filter: none;
    }
  }

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

    padding: 16px;
  }

  h1 {
    margin-block-start: 0;
    font-size: 4rem;
    font-weight: 700;
    color: var(--md-sys-color-secondary);
  }
</style>
