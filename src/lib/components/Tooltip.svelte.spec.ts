import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Tooltip from "./Tooltip.svelte";
import TooltipTitleFixture from "./fixtures/tooltip-title-fixture.svelte";

describe("Tooltip.svelte", () => {
  it("renders a string title as HTML", async () => {
    const screen = await render(Tooltip, { title: "<b>bold title</b>" });
    const bold = screen.getByText("bold title");
    await expect.element(bold).toBeInTheDocument();
    expect(bold.element().tagName).toBe("B");
  });

  it("renders the shortcut as nested kbd keys", async () => {
    const screen = await render(Tooltip, {
      title: "t",
      shortcut: "Ctrl+Shift+K",
    });
    const nested = () =>
      [...screen.container.querySelectorAll("kbd kbd")].map(
        (it) => it.textContent,
      );
    expect(nested()).toEqual(["Ctrl", "Shift", "K"]);
  });

  it("omits the shortcut block when unset", async () => {
    const screen = await render(Tooltip, { title: "no shortcut" });
    expect(screen.container.querySelectorAll("kbd").length).toBe(0);
  });

  it("renders snippet titles and the shortcut together", async () => {
    const screen = await render(TooltipTitleFixture, {});
    const snippetTitle = screen.getByText("snippet title");
    await expect.element(snippetTitle).toBeInTheDocument();
    expect(snippetTitle.element().tagName).toBe("B");
    const nested = [...screen.container.querySelectorAll("kbd kbd")].map(
      (it) => it.textContent,
    );
    expect(nested).toEqual(["Ctrl", "K"]);
  });

  it("renders nothing extra without title", async () => {
    const screen = await render(Tooltip, {});
    expect(screen.container.querySelectorAll("p").length).toBe(0);
  });
});
