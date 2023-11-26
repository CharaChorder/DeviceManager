import type { Action } from "svelte/action"
import tippy from "tippy.js"
import type { SvelteComponent } from "svelte"
import Tooltip from "$lib/components/Tooltip.svelte"
import hotkeys from "hotkeys-js"

export const action: Action<HTMLElement, { title?: string; shortcut?: string }> = (
  node: HTMLElement,
  { title, shortcut },
) => {
  let component: SvelteComponent | undefined
  const tooltip = tippy(node, {
    arrow: false,
    theme: "tooltip",
    animation: "fade",
    onShow(instance) {
      component ??= new Tooltip({
        target: instance.popper.querySelector(".tippy-content") as HTMLElement,
        props: { title, shortcut },
      })
    },
    onHidden() {
      component?.$destroy()
      component = undefined
    },
  })

  if (shortcut) {
    hotkeys(shortcut, function(keyboardEvent) {
      keyboardEvent.preventDefault()
      node.click()
    })
  }

  return {
    destroy() {
      tooltip.destroy()
      hotkeys.unbind(shortcut)
    },
  }
}
