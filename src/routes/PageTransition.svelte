<script lang="ts">
  import {fly} from "svelte/transition"
  import {afterNavigate, beforeNavigate} from "$app/navigation"
  import {expoIn, expoOut} from "svelte/easing"

  let inDirection = 0
  let outDirection = 0
  let outroEnd: undefined | (() => void) = undefined
  let animationDone: Promise<void>

  let isNavigating = false

  const routeOrder = ["/config/chords/", "/config/layout/", "/config/settings/"]

  beforeNavigate(navigation => {
    const from = navigation.from?.url.pathname
    const to = navigation.to?.url.pathname
    if (from === to) return
    isNavigating = true

    if (!(from && to && routeOrder.includes(from) && routeOrder.includes(to))) {
      inDirection = 0
      outDirection = 0
    } else {
      const fromIndex = routeOrder.indexOf(from)
      const toIndex = routeOrder.indexOf(to)

      inDirection = fromIndex > toIndex ? -1 : 1
      outDirection = fromIndex > toIndex ? 1 : -1
    }

    animationDone = new Promise(resolve => {
      outroEnd = resolve
    })
  })

  afterNavigate(async () => {
    await animationDone
    isNavigating = false
  })
</script>

{#if !isNavigating}
  <main
    in:fly={{x: inDirection * 24, duration: 150, easing: expoOut}}
    out:fly={{x: outDirection * 24, duration: 150, easing: expoIn}}
    on:outroend={outroEnd}
  >
    <slot />
  </main>
{/if}
