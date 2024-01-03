import {get, writable} from "svelte/store"

export const osLayout = writable<Map<string, string>>(new Map())

async function updateLayout() {
  const layout: Map<string, string> = await (navigator as any).keyboard.getLayoutMap()
  const currentLayout = get(osLayout)
  if (
    layout.size !== currentLayout.size ||
    [...layout.keys()].some(key => layout.get(key) !== currentLayout.get(key))
  ) {
    osLayout.set(layout)
  }
}

export function runLayoutDetection(): () => void {
  if ("keyboard" in navigator) {
    updateLayout()
    const timer = setInterval(updateLayout, 5000)
    return () => clearInterval(timer)
  } else {
    console.warn("Keyboard API not supported")
    return () => {}
  }
}
