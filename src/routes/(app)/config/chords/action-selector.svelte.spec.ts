import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { selectAction } from "./action-selector";

/**
 * `selectAction` opens the floating ActionSelector at the clicked key's
 * position, scales the dialog in, forwards the picked action, and unmounts
 * it with a closing animation once a value is picked or the backdrop is
 * clicked.
 */

function clickTarget(): MouseEvent {
  const button = document.createElement("button");
  button.style.position = "fixed";
  button.style.left = "20px";
  button.style.top = "20px";
  document.body.appendChild(button);
  const event = new MouseEvent("click", { bubbles: true });
  Object.defineProperty(event, "target", { value: button });
  return event;
}

afterEach(() => {
  // selectAction mounts outside render()'s auto-cleanup; drop leftovers
  for (const leftover of document.body.querySelectorAll("dialog")) {
    leftover.remove();
  }
  for (const leftover of document.body.querySelectorAll("button")) {
    if (!leftover.closest("dialog")) leftover.remove();
  }
});

describe("selectAction", () => {
  it("forwards the picked action and dismisses", async () => {
    const select = vi.fn();
    const dismissed = vi.fn();

    selectAction(clickTarget(), select, dismissed);

    // the ActionList populates its list asynchronously
    await expect
      .poll(() => document.body.querySelectorAll("dialog button").length)
      .toBeGreaterThan(1);

    const [leftCtrl] = await page
      .getByRole("button", { name: /Control Keyboard Modifier/ })
      .elements();
    await userEvent.click(leftCtrl!);

    // LEFT_CTRL's action code
    expect(select).toHaveBeenCalledWith(512);
    await expect
      .poll(() => document.querySelector("dialog"), { timeout: 5000 })
      .toBeNull();
    expect(dismissed).toHaveBeenCalledOnce();
  }, 20_000);

  it("closes on a backdrop click without selecting", async () => {
    const select = vi.fn();
    const dismissed = vi.fn();

    selectAction(clickTarget(), select, dismissed);

    await expect.poll(() => !!document.querySelector("dialog")).toBe(true);

    const backdrop = document.querySelector("dialog")!;
    // a click landing on the dialog element itself is the backdrop case
    backdrop.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(select).not.toHaveBeenCalled();
    await expect
      .poll(() => document.querySelector("dialog"), { timeout: 5000 })
      .toBeNull();
    expect(dismissed).toHaveBeenCalledOnce();
  }, 20_000);
});
