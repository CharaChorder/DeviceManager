import type { Action } from "svelte/action";
import tippy from "tippy.js";
import { mount, unmount, type Snippet } from "svelte";
import Tooltip from "$lib/components/Tooltip.svelte";
import type { Attachment } from "svelte/attachments";

export const hotkeys = new Map<string, HTMLElement>();

/**
 * @deprecated Use `tooltip` instead.
 */
export const action: Action<Element, { title?: string; shortcut?: string }> = (
  node: Element,
  { title, shortcut },
) => {
  let component: {} | undefined;
  const tooltip = tippy(node, {
    arrow: false,
    theme: "tooltip",
    animation: "fade",
    onShow(instance) {
      component ??= mount(Tooltip, {
        target: instance.popper.querySelector(".tippy-content") as Element,
        props: { title, shortcut },
      });
    },
    onHidden() {
      if (component) {
        unmount(component);
        component = undefined;
      }
    },
  });

  if (shortcut && node instanceof HTMLElement) {
    hotkeys.set(shortcut, node);
  }

  return {
    destroy() {
      tooltip.destroy();
      if (shortcut && node instanceof HTMLElement) {
        hotkeys.delete(shortcut);
      }
    },
  };
};

export function actionTooltip(
  title: string | Snippet,
  shortcut?: string,
): Attachment<Element> {
  return (node: Element) => {
    let component: {} | undefined;
    const tooltip = tippy(node, {
      arrow: false,
      theme: "tooltip",
      animation: "fade",
      onShow(instance) {
        component ??= mount(Tooltip, {
          target: instance.popper.querySelector(".tippy-content") as Element,
          props: { shortcut, title },
        });
      },
      onHidden() {
        if (component) {
          unmount(component);
          component = undefined;
        }
      },
    });

    if (shortcut && node instanceof HTMLElement) {
      hotkeys.set(shortcut, node);
    }

    return () => {
      tooltip.destroy();
      if (shortcut && node instanceof HTMLElement) {
        hotkeys.delete(shortcut);
      }
    };
  };
}
