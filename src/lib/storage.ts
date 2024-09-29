import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { browser } from "$app/environment";

export function persistentWritable<T>(
  key: string,
  value: T,
  condition?: () => boolean,
): Writable<T> {
  if (browser) {
    const persistedValue = localStorage.getItem(key);
    let store: Writable<T>;
    try {
      store =
        persistedValue !== null
          ? writable(JSON.parse(persistedValue))
          : writable(value);
    } catch (e) {
      console.error(e);
    } finally {
      store = writable(value);
    }
    store.subscribe((value) => {
      if (!condition || condition())
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
  } else {
    return writable(value);
  }
}
