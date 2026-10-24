import { render } from "vitest-browser-svelte";
import { describe, expect, it, vi } from "vitest";
import ProgressButtonFixture from "./fixtures/progress-button-fixture.svelte";

describe("ProgressButton", async () => {
  it("renders an enabled primary button when idle", async () => {
    const onclick = vi.fn();
    const screen = await render(ProgressButtonFixture, {
      label: "Sync",
      onclick,
      working: false,
      progress: 0,
    });
    const button = screen
      .getByTestId("progress-button")
      .element() as HTMLButtonElement;

    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass("primary");
    expect(button).not.toHaveClass("working");
    expect(button).not.toHaveClass("progress");

    button.click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("calls the click handler only while idle", async () => {
    const onclick = vi.fn();
    const screen = await render(ProgressButtonFixture, {
      label: "Sync",
      onclick,
      working: true,
      progress: 0,
    });
    const button = screen
      .getByTestId("progress-button")
      .element() as HTMLButtonElement;

    expect(button).toBeDisabled();
    expect(button).toHaveClass("working");
    button.click();
    expect(onclick).not.toHaveBeenCalled();
  });

  it("shows an indeterminate progress class mid-progress", async () => {
    const screen = await render(ProgressButtonFixture, {
      label: "Update",
      onclick: () => {},
      working: true,
      progress: 0.5,
    });
    const button = screen
      .getByTestId("progress-button")
      .element() as HTMLButtonElement;

    expect(button).toHaveClass("progress");
    expect(button).not.toHaveClass("working");
    // jest-dom's toHaveStyle ignores custom properties
    expect(button.getAttribute("style")).toContain("--progress: 50%");
  });

  it("shows the error class when an error is present", async () => {
    const screen = await render(ProgressButtonFixture, {
      label: "Update",
      onclick: () => {},
      working: false,
      progress: 0,
      error: "boom",
    });
    const button = screen
      .getByTestId("progress-button")
      .element() as HTMLButtonElement;

    expect(button).toHaveClass("error");
    expect(button).not.toHaveClass("primary");
  });

  it("respects the disabled prop", async () => {
    const screen = await render(ProgressButtonFixture, {
      label: "Sync",
      onclick: () => {},
      working: false,
      progress: 0,
      disabled: true,
    });
    expect(screen.getByTestId("progress-button").element()).toBeDisabled();
  });
});
