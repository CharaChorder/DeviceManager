import type { Action } from "svelte/action";
import { persistentWritable } from "$lib/storage";

export interface UserPreferences {
  backup: boolean;
  autoConnect: boolean;
}

export interface UserTheme {
  color: string;
  mode: "light" | "dark" | "auto";
}

export const theme = persistentWritable<UserTheme>("user-theme", {
  color: "#6D81C7",
  mode: "dark",
});

export const userPreferences = persistentWritable<UserPreferences>(
  "user-preferences",
  {
    backup: false,
    autoConnect: false,
  },
);

export const preference: Action<HTMLInputElement, keyof UserPreferences> = (
  node,
  key,
) => {
  const unsubscribe = userPreferences.subscribe((it) => {
    node.checked = it[key];
  });
  function update() {
    userPreferences.update((value) => {
      value[key] = node.checked;
      return value;
    });
  }
  node.addEventListener("input", update);

  return {
    destroy() {
      unsubscribe();
      node.removeEventListener("input", update);
    },
  };
};
