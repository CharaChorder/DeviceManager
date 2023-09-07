import type {Action} from "svelte/action"
import {serialPort, unsavedChanges} from "$lib/serial/connection"
import {get} from "svelte/store"

export const setting: Action<HTMLInputElement, {id: number; inverse?: number; scale?: number}> = function (
  node: HTMLInputElement,
  {id, inverse, scale},
) {
  node.setAttribute("disabled", "")
  const type = node.getAttribute("type") as "number" | "checkbox"

  const unsubscribe = serialPort.subscribe(async port => {
    if (port) {
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

  async function listener(event: Event) {
    const currentValue = await get(serialPort)!.getSetting(id)
    let value = 0
    if (type === "number") {
      value = Number((event as InputEvent).data)
      if (Number.isNaN(value)) return
      value = inverse !== undefined ? inverse / value : scale !== undefined ? value / scale : value
    } else {
      value = node.checked ? 1 : 0
    }
    await get(serialPort)!.setSetting(id, value)

    const originalValue = get(unsavedChanges).get(id)
    unsavedChanges.update(it => {
      if (originalValue === value) {
        it.delete(id)
      } else if (!it.has(id)) {
        it.set(id, currentValue)
      }
      return it
    })
  }
  node.addEventListener("input", listener)

  return {
    destroy() {
      node.removeEventListener("input", listener)
      unsubscribe()
    },
  }
}
