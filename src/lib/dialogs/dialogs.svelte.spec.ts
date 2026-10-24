import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

/**
 * Dialog launcher functions mount their components on demand and resolve
 * from the components' confirm/abort/close callbacks. The dialogs mount
 * themselves (via `svelte`'s `mount`), so the queries run against the
 * page, not a `render` screen.
 */

const chord = { actions: [32, 51], phrase: [0x20, 0x68], deleted: false };

describe("askForConfirmation", () => {
  it("resolves true when the confirm button is clicked", async () => {
    const { askForConfirmation } = await import("$lib/dialogs/confirm-dialog");
    const result = askForConfirmation(
      "Delete chord?",
      "This removes the chord",
      "Confirm It",
      "Cancel It",
      chord,
    );

    await page.getByRole("button", { name: "Confirm It" }).click();
    expect(await result).toBe(true);

    // unmounted after resolution
    await expect.poll(() => document.body.querySelector("dialog")).toBeNull();
  });

  it("resolves false when the abort button is clicked", async () => {
    const { askForConfirmation } = await import("$lib/dialogs/confirm-dialog");
    const result = askForConfirmation(
      "Overwrite layout?",
      "This replaces the profile layout",
      "Yes",
      "Nope",
      chord,
    );

    await page.getByRole("button", { name: "Nope" }).click();
    expect(await result).toBe(false);
  });
});

describe("showConnectionFailedDialog", () => {
  it("renders the message and resolves on close", async () => {
    const { showConnectionFailedDialog } =
      await import("$lib/dialogs/connection-failed-dialog");
    const result = showConnectionFailedDialog("Serial Timeout");

    await expect
      .poll(() => document.body.textContent?.includes("Serial Timeout"))
      .toBe(true);
    await page.getByRole("button", { name: "Close" }).click();
    await expect(result).resolves.toBeUndefined();
  });
});
