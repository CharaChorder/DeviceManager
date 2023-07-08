<script lang="ts">
  import "$lib/fonts/noto-sans-mono.scss"
  import "$lib/fonts/material-symbols-rounded.scss"
  import "$lib/style/scrollbar.scss"
  import {onMount} from "svelte"
  import {applyTheme, argbFromHex, themeFromSourceColor} from "@material/material-color-utilities"
  import Navigation from "$lib/components/Navigation.svelte"
  import {hasSerialPermission} from "$lib/serial/device"
  import {initSerial} from "$lib/serial/connection"
  // noinspection TypeScriptCheckImport
  import {pwaInfo} from "virtual:pwa-info"
  import type {LayoutServerData} from "./$types"
  import type {RegisterSWOptions} from "vite-plugin-pwa/types"
  import {initLocalStorage} from "$lib/serial/storage"

  export let data: LayoutServerData

  onMount(async () => {
    const theme = themeFromSourceColor(argbFromHex("#6D81C7"), [
      {name: "success", value: argbFromHex("#00ff00"), blend: true},
    ])
    const dark = true // window.matchMedia("(prefers-color-scheme: dark)").matches
    applyTheme(theme, {target: document.body, dark})
    initLocalStorage()

    if (pwaInfo) {
      // noinspection TypeScriptCheckImport
      const {registerSW} = await import("virtual:pwa-register")
      registerSW({
        immediate: true,
        onRegisterError(error) {
          console.log("ServiceWorker Registration Error", error)
        },
      } satisfies RegisterSWOptions)
    }

    if (await hasSerialPermission()) await initSerial()
  })

  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ""
</script>

<svelte:head>
  {@html webManifestLink}
  <title>dot i/o</title>
  <meta name="description" content="Tool for CharaChorder devices" />
  <meta name="theme-color" content={data.themeColor} />
</svelte:head>

<Navigation />

<main>
  <slot />
</main>

<style lang="scss" global>
  * {
    box-sizing: border-box;
    appearance: none;
  }

  a {
    color: var(--md-sys-color-tertiary);
  }

  .button:hover:not(:active),
  a:hover:not(:active),
  button:hover:not(:active) {
    filter: brightness(70%);

    &.active {
      filter: brightness(120%);
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
