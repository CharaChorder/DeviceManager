import {writable} from "svelte/store"
import type {Action} from "svelte/action"

export interface UserPreferences {
  backup: boolean
  autoSync: boolean
}

export const userPreferences = writable<UserPreferences>({
  backup: false,
  autoSync: true,
})

export const preference: Action<HTMLInputElement, keyof UserPreferences> = (node, key) => {
  const unsubscribe = userPreferences.subscribe(it => {
    node.checked = it[key]
  })
  function update() {
    userPreferences.update(value => {
      value[key] = node.checked
      return value
    })
  }
  node.addEventListener("input", update)

  return {
    destroy() {
      unsubscribe()
      node.removeEventListener("input", update)
    },
  }
}
