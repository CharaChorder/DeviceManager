import type {Action} from "svelte/action"
import ActionSelector from "$lib/components/layout/ActionSelector.svelte"
import {changes, layout} from "$lib/serial/connection"
import {get} from "svelte/store"

export const editableLayout: Action<HTMLButtonElement, {activeLayer: number; id: number}> = (
  node,
  {id, activeLayer},
) => {
  let component: ActionSelector | undefined
  function present() {
    component?.$destroy()
    component = new ActionSelector({
      target: document.body,
      props: {currentAction: get(layout)[activeLayer][id]},
    })
    component.$on("close", () => {
      component!.$destroy()
    })
    component.$on("select", ({detail}) => {
      changes.update(changes => {
        changes.push({layout: {[activeLayer]: {[id]: detail}}})
        return changes
      })
      component!.$destroy()
    })
  }

  node.addEventListener("click", present)
  return {
    destroy() {
      node.removeEventListener("click", present)
    },
  }
}
