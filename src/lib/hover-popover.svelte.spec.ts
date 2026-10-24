import { afterEach, describe, expect, it } from "vitest";
import { hotkeys, tooltip } from "$lib/hover-popover";

/**
 * The hover-popover attachment drives a native popover element from
 * mouse/focus events and registers optional hotkey owners.
 */

let pop: HTMLElement | undefined;
let node: HTMLElement | undefined;
let detach: (() => void) | undefined;

function attach(shortcut?: string) {
  pop = document.createElement("div");
  pop.setAttribute("popover", "auto");
  document.body.appendChild(pop);

  node = document.createElement("button");
  document.body.appendChild(node);

  const cleanup = tooltip(pop, shortcut)(node);
  detach = typeof cleanup === "function" ? cleanup : undefined;
  return { pop, node };
}

afterEach(() => {
  detach?.();
  detach = undefined;
  pop?.remove();
  node?.remove();
  pop = undefined;
  node = undefined;
});

describe("hover-popover", () => {
  it("opens the popover on mouseenter/focus and closes on mouseleave/blur", () => {
    const { pop, node } = attach();

    expect(pop.matches(":popover-open")).toBe(false);

    node.dispatchEvent(new Event("mouseenter"));
    expect(pop.matches(":popover-open")).toBe(true);

    node.dispatchEvent(new Event("mouseleave"));
    expect(pop.matches(":popover-open")).toBe(false);

    node.dispatchEvent(new Event("focus"));
    expect(pop.matches(":popover-open")).toBe(true);

    node.dispatchEvent(new Event("blur"));
    expect(pop.matches(":popover-open")).toBe(false);
  });

  it("registers and releases hotkey owners", () => {
    const { node } = attach("Ctrl+K");

    expect(hotkeys.get("Ctrl+K")).toBe(node);

    detach?.();
    detach = undefined;
    expect(hotkeys.has("Ctrl+K")).toBe(false);
  });

  it("tolerates a missing popover target", () => {
    const target: HTMLElement | undefined = undefined;
    const node = document.createElement("button");
    document.body.appendChild(node);
    const cleanup = tooltip(target)(node);

    expect(() => node.dispatchEvent(new Event("mouseenter"))).not.toThrow();
    expect(node.matches(":popover-open")).toBe(false);

    if (typeof cleanup === "function") cleanup();
    node.remove();
  });

  it("detaching removes all listeners", () => {
    const { pop, node } = attach();

    detach?.();
    detach = undefined;

    node.dispatchEvent(new Event("mouseenter"));
    expect(pop.matches(":popover-open")).toBe(false);
  });
});
