import tippy from "tippy.js"
import InputEdit from "$lib/components/InputEdit.svelte"
import type {Action} from "svelte/action"

export const editableLayout: Action<HTMLButtonElement, {id: number; quadrant: number}> = (
  node,
  {id, quadrant},
) => {
  let component: InputEdit | undefined
  const edit = tippy(node, {
    interactive: true,
    appendTo: document.body,
    trigger: "click",
    placement: (["top", "right", "bottom", "left"] as const)[quadrant],
    onShow(instance) {
      component ??= new InputEdit({
        target: instance.popper.querySelector(".tippy-content")!,
        props: {id},
      })
    },
    onHidden() {
      component?.$destroy()
      component = undefined
    },
  })

  return {
    destroy() {
      edit.destroy()
    },
  }
}
