<script>
  import "$lib/style/fonts/noto-sans-mono.scss"
  import "$lib/style/fonts/material-symbols-rounded.scss"
  import {onMount} from "svelte"
  import {applyTheme, argbFromHex, themeFromSourceColor} from "@material/material-color-utilities"
  import Navigation from "$lib/components/Navigation.svelte"
  import {chords, serialPort, syncing} from "$lib/serial/connection.js"
  import {CharaDevice} from "$lib/serial/device.js"

  /** @type {import('$lib/serial/device.js').CharaDevice} */
  let device // @hmr:keep

  onMount(async () => {
    const theme = themeFromSourceColor(argbFromHex("#6D81C7"), [
      {name: "success", value: argbFromHex("#00ff00"), blend: true},
    ])
    const dark = true // window.matchMedia("(prefers-color-scheme: dark)").matches
    applyTheme(theme, {target: document.body, dark})

    syncing.set(true)
    device ??= new CharaDevice()
    serialPort.set(device)

    const chordCount = await device.getChordCount()
    const chordInfo = []
    for (let i = 0; i < chordCount; i++) {
      chordInfo.push(await device.getChord(i))
    }
    chordInfo.sort(({phrase: a}, {phrase: b}) => a.localeCompare(b))
    chords.set(chordInfo)
    syncing.set(false)
  })
</script>

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
    font-weight: 900;
    color: var(--md-sys-color-secondary);
  }
</style>
