import { render } from "vitest-browser-svelte";
import { describe, expect, it, vi } from "vitest";
import ActionListItem from "./ActionListItem.svelte";

describe("ActionListItem", () => {
  it("renders the title and glyph of a known action", async () => {
    const screen = await render(ActionListItem, { id: 51 });
    const title = screen.getByText("Three");
    await expect.element(title).toBeInTheDocument();
    expect(title.element().tagName).toBe("B");
    await expect.element(screen.getByText("3")).toBeInTheDocument();
  });

  it("invokes the click handler with the button", async () => {
    const onclick = vi.fn();
    const screen = await render(ActionListItem, { id: 51, onclick });
    const button = screen.getByRole("button");
    await button.click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("falls back to the hex code for unknown actions", async () => {
    const screen = await render(ActionListItem, { id: 8191 });
    await expect.element(screen.getByText("0x1fff")).toBeInTheDocument();
  });

  it("renders the description of ASCII actions", async () => {
    const screen = await render(ActionListItem, { id: 32 });
    const description = screen.getByText(/While SPACE is used/);
    await expect.element(description).toBeInTheDocument();
    expect(description.element().tagName).toBe("I");
  });
});
