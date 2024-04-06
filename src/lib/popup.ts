import tippy from "tippy.js";
import type { Action } from "svelte/action";
import type { ComponentType, SvelteComponent } from "svelte";

export const popup: Action<HTMLButtonElement, ComponentType> = (
  node,
  Component,
) => {
  let component: SvelteComponent | undefined;
  let target: HTMLElement | undefined;
  const edit = tippy(node, {
    interactive: true,
    trigger: "click",
    onShow(instance) {
      target = instance.popper.querySelector(".tippy-content") as HTMLElement;
      target.classList.add("active");
      component ??= new Component({ target });
    },
    onHidden() {
      component?.$destroy();
      target?.classList.remove("active");
      component = undefined;
    },
  });

  return {
    destroy() {
      edit.destroy();
    },
  };
};
