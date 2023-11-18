import type {Action} from "svelte/action"
import tippy from "tippy.js"
import type {Props} from "tippy.js"

export const tooltip: Action<HTMLElement, Partial<Props>> = function (node, props) {
  const instance = tippy(node, props)

  return {
    destroy() {
      instance.destroy()
    },
  }
}
