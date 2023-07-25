import type {Action} from "svelte/action"
import {serialPort} from "$lib/serial/connection"

export const setting: Action<HTMLInputElement, {id: number; inverse?: number; scale?: number}> = function (
  node: HTMLInputElement,
  {id, inverse, scale},
) {
  node.setAttribute("disabled", "")

  const unsubscribe = serialPort.subscribe(async port => {
    if (port) {
      const type = node.getAttribute("type") as "number" | "checkbox"
      if (type === "number") {
        const value = Number(await port.getSetting(id).then(it => it.toString()))
        node.value = (
          inverse !== undefined ? inverse / value : scale !== undefined ? scale * value : value
        ).toString()
      } else {
        node.checked = await port.getSetting(id).then(it => it !== 0)
      }
      node.removeAttribute("disabled")
    } else {
      node.setAttribute("disabled", "")
    }
  })
  function listener() {}
  node.addEventListener("input", listener)

  return {
    destroy() {
      node.removeEventListener("input", listener)
      unsubscribe()
    },
  }
}
