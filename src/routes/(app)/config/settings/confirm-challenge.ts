import type { Action } from "svelte/action";
import ConfirmChallenge from "./ConfirmChallenge.svelte";
import tippy from "tippy.js";
import { mount, unmount } from "svelte";

export const confirmChallenge: Action<
  HTMLElement,
  { onConfirm: () => void; challenge: string }
> = (node, { onConfirm, challenge }) => {
  let component: {} | undefined;
  let target: HTMLElement | undefined;
  const edit = tippy(node, {
    interactive: true,
    trigger: "click",
    onShow(instance) {
      target = instance.popper.querySelector(".tippy-content") as HTMLElement;
      target.classList.add("active");
      if (component === undefined) {
        component = mount(ConfirmChallenge, {
          target,
          props: {
            challenge,
            onconfirm() {
              edit.hide();
              onConfirm();
            },
          },
        });
      }
    },
    onHidden() {
      if (component) {
        unmount(component);
      }
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
