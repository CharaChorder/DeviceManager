import {persistentWritable} from "$lib/storage"
import {get} from "svelte/store"

export const osLayout = persistentWritable<Record<string, string>>("os-layout", {})

const keysCurrentlyDown = new Set<string>()

function keydown({code, key}: KeyboardEvent) {
  const keys = [...keysCurrentlyDown]
  keysCurrentlyDown.add(code)

  const keyString = JSON.stringify([...keys.sort(), code])
  if (keyString in get(osLayout) || get(osLayout)[JSON.stringify([code])] === key) return

  osLayout.update(layout => {
    layout[keyString] = key
    return layout
  })
}

function keyup({code}: KeyboardEvent) {
  keysCurrentlyDown.delete(code)
}

export function runLayoutDetection() {
  if ("keyboard" in navigator) {
    ;(navigator.keyboard as any).getLayoutMap().then((layout: Map<string, string>) => {
      osLayout.update(osLayout => {
        Object.assign(
          osLayout,
          Object.fromEntries([...layout.entries()].map(([key, value]) => [JSON.stringify([key]), value])),
        )
        return osLayout
      })
    })
  }
  window.addEventListener("keydown", keydown)
  window.addEventListener("keyup", keyup)
}
