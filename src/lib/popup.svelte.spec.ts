import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { userEvent } from "vitest/browser";
import PopupButtonFixture from "./components/fixtures/popup-button-fixture.svelte";

/**
 * `use:popup` mounts a component inside a tippy popper on click and
 * unmounts it again when the popper hides.
 */

describe("use:popup", () => {
  it("mounts the component into the popper on click", async () => {
    const screen = await render(PopupButtonFixture);
    const button = (await screen
      .getByRole("button")
      .element()) as HTMLButtonElement;

    expect(document.querySelector(".popup-text")).toBeNull();

    button.click();

    // tippy v6: the popper root is a plain div; the box carries the class
    await expect
      .poll(() => document.querySelector(".tippy-box"))
      .not.toBeNull();
    expect(document.querySelector(".popup-text")).not.toBeNull();
    expect(document.querySelector(".popup-text")?.textContent).toBe(
      "popup content",
    );
    // mounted inside the popper's content element, marked active
    expect(
      document.querySelector(".tippy-content.active .popup-text"),
    ).not.toBeNull();
  });

  it("unmounts on hide and remounts on the next show", async () => {
    const screen = await render(PopupButtonFixture);
    const button = (await screen
      .getByRole("button")
      .element()) as HTMLButtonElement;

    button.click();
    await expect
      .poll(() => document.querySelector(".popup-text"))
      .not.toBeNull();

    // clicking outside hides the interactive popper; tippy ignores
    // synthetic zero-coordinate clicks, so this must be a trusted click
    await userEvent.click(document.body);
    await expect
      .poll(() => document.querySelector(".popup-text"), { timeout: 3000 })
      .toBeNull();

    button.click();
    await expect
      .poll(() => document.querySelector(".popup-text"))
      .not.toBeNull();
  });
});
