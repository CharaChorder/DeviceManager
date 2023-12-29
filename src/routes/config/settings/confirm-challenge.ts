import type {Action} from "svelte/action"
import ConfirmChallenge from "./ConfirmChallenge.svelte"
import tippy from "tippy.js"

export const confirmChallenge: Action<HTMLElement, {onConfirm: () => void; challenge: string}> = (
  node,
  {onConfirm, challenge},
) => {
  let component: ConfirmChallenge | undefined
  let target: HTMLElement | undefined
  const edit = tippy(node, {
    interactive: true,
    trigger: "click",
    onShow(instance) {
      target = instance.popper.querySelector(".tippy-content") as HTMLElement
      target.classList.add("active")
      if (component === undefined) {
        component = new ConfirmChallenge({target, props: {challenge}})
        component.$on("confirm", () => {
          edit.hide()
          onConfirm()
        })
      }
    },
    onHidden() {
      component?.$destroy()
      target?.classList.remove("active")
      component = undefined
    },
  })

  return {
    destroy() {
      edit.destroy()
    },
  }
}
