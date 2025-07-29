import type { Attachment } from "svelte/attachments";

export const hotkeys = new Map<string, HTMLElement>();

export function tooltip(
  target: HTMLElement | undefined,
  shortcut?: string,
): Attachment<HTMLElement> {
  return (node: HTMLElement) => {
    function show() {
      if (!target) return;
      target.showPopover({ source: node });
    }
    function hide() {
      if (!target) return;
      target.hidePopover();
    }

    node.addEventListener("mouseenter", show);
    node.addEventListener("focus", show);
    node.addEventListener("mouseout", hide);
    node.addEventListener("blur", hide);

    if (shortcut && node instanceof HTMLElement) {
      hotkeys.set(shortcut, node);
    }

    return () => {
      node.removeEventListener("mouseenter", show);
      node.removeEventListener("focus", show);
      node.removeEventListener("mouseout", hide);
      node.removeEventListener("blur", hide);

      if (shortcut && node instanceof HTMLElement) {
        hotkeys.delete(shortcut);
      }
    };
  };
}
