import { describe, expect, it } from "vitest";
import { mount, unmount } from "svelte";
import { render } from "vitest-browser-svelte";
import { userEvent } from "vitest/browser";
import TooltipActionFixture from "./components/fixtures/tooltip-action-fixture.svelte";

/**
 * `use:tooltip` instantiates a tippy instance on the node with the given
 * props; the popper shows on hover and is destroyed with the action.
 */

describe("use:tooltip", () => {
  it("shows the tippy content on hover", async () => {
    const screen = await render(TooltipActionFixture);
    const button = await screen.getByRole("button").element();

    expect(document.querySelector(".tippy-box")).toBeNull();

    await userEvent.hover(button);

    const box = await expect
      .poll(() => document.querySelector(".tippy-box"))
      .not.toBeNull()
      .then(() => document.querySelector(".tippy-box"));
    expect(box?.textContent).toBe("Hover tip");
  });

  it("destroys the instance when the action is destroyed", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const component = mount(TooltipActionFixture, { target });
    const button = target.querySelector("button")!;

    await userEvent.hover(button);
    await expect
      .poll(() => document.querySelector(".tippy-box"))
      .not.toBeNull();

    unmount(component);

    await expect
      .poll(() => document.querySelector(".tippy-box"), { timeout: 3000 })
      .toBeNull();
  });
});
