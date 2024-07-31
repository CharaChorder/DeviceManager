import tippy from "tippy.js";
import type { Action } from "svelte/action";
import { unmount, mount, type Component } from "svelte";

export const popup: Action<HTMLButtonElement, Component> = (
  node,
  Component,
) => {
  let component: {} | undefined;
  let target: HTMLElement | undefined;
  const edit = tippy(node, {
    interactive: true,
    trigger: "click",
    onShow(instance) {
      target = instance.popper.querySelector(".tippy-content") as HTMLElement;
      target.classList.add("active");
      component ??= mount(Component, { target });
    },
    onHidden() {
      if (component) {
        unmount(component);
        component = undefined;
      }
      target?.classList.remove("active");
    },
  });

  return {
    destroy() {
      edit.destroy();
    },
  };
};
