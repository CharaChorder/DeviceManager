import type {Action} from "svelte/action"
import Index from "flexsearch"
import {KEYMAP_CODES} from "$lib/serial/keymap-codes"
import tippy from "tippy.js"
import ActionAutocomplete from "$lib/components/ActionAutocomplete.svelte"
import {browser} from "$app/environment"

const index = browser ? new Index({tokenize: "full"}) : undefined
for (const action of Object.values(KEYMAP_CODES)) {
  index?.add(
    action.code,
    `${action.title || ""} ${action.variant || ""} ${action.category} ${action.id || ""} ${
      action.description || ""
    }`,
  )
}
const exact = Object.fromEntries(
  Object.values(KEYMAP_CODES)
    .filter(it => !!it.id)
    .map(it => [it.id, it] as const),
)

export const actionAutocomplete: Action<HTMLInputElement> = node => {
  if (!browser) return

  let completionComponent: ActionAutocomplete
  const completionDialog = tippy(node, {
    interactive: true,
    placement: "bottom-start",
    hideOnClick: false,
    theme: "surface-variant search-completion",
    arrow: false,
    trigger: "focus",
    offset: [0, 0],
    onCreate(instance) {
      const target = instance.popper.querySelector(".tippy-content")!
      completionComponent = new ActionAutocomplete({target, props: {width: node.clientWidth}})
    },
    onDestroy() {
      completionComponent.$destroy()
    },
  })

  function input(event: Event) {
    completionComponent.$set({
      results: index!.search(node.value),
      exact: exact[node.value],
      code: Number(node.value),
    })
  }

  node.addEventListener("input", input)

  return {
    destroy() {
      node.removeEventListener("input", input)
    },
  }
}
