import { render } from "vitest-browser-svelte";
import { describe, expect, it } from "vitest";
import ActionString from "./ActionString.svelte";

describe("ActionString", () => {
  it("renders single-character ids as plain text inline", async () => {
    const screen = await render(ActionString, { actions: [41, 51] });
    const closing = screen.getByText(")");
    const three = screen.getByText("3");
    await expect.element(closing).toBeInTheDocument();
    expect(closing.element().tagName).toBe("SPAN");
    expect(three.element().tagName).toBe("SPAN");
  });

  it("renders kbd elements in keys display", async () => {
    const screen = await render(ActionString, {
      actions: [41, 51],
      display: "keys",
    });
    const keys = [...screen.container.querySelectorAll("kbd")].map(
      (it) => it.textContent,
    );
    expect(keys).toEqual([")", "3"]);
  });

  it("marks unknown codes as errors", async () => {
    const screen = await render(ActionString, { actions: [8191] });
    const unknown = screen.getByText("0x1fff");
    await expect.element(unknown).toBeInTheDocument();
    expect(unknown.element().tagName).toBe("KBD");
    expect(unknown.element()).toHaveClass("error");
    expect(unknown.element()).toHaveClass("warn");
  });

  it("renders inline KeyInfo objects", async () => {
    const screen = await render(ActionString, {
      actions: [{ code: 4000, display: "ABC" }],
    });
    await expect.element(screen.getByText("ABC")).toBeInTheDocument();
  });

  it("renders an empty string for no actions", async () => {
    const screen = await render(ActionString, { actions: [] });
    expect(screen.container.childElementCount).toBe(0);
  });
});
