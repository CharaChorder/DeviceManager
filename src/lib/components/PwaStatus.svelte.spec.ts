import { render } from "vitest-browser-svelte";
import { beforeEach, describe, expect, it } from "vitest";
import { __pwa, __updateCalls } from "virtual:pwa-register/svelte";
import PwaStatus from "./PwaStatus.svelte";

describe("PwaStatus", () => {
  beforeEach(() => {
    __pwa.needRefresh.set(false);
    __pwa.offlineReady.set(false);
    __updateCalls.length = 0;
  });

  it("renders nothing when the service worker is quiet", async () => {
    const screen = await render(PwaStatus);
    expect(screen.container.childElementCount).toBe(0);
  });

  it("shows an update button when a refresh is needed", async () => {
    __pwa.needRefresh.set(true);
    const screen = await render(PwaStatus);
    await expect
      .element(screen.getByRole("button", { name: "Update" }))
      .toBeInTheDocument();
  });

  it("requests a service worker reload on click", async () => {
    __pwa.needRefresh.set(true);
    const screen = await render(PwaStatus);
    await screen.getByRole("button", { name: "Update" }).click();
    expect(__updateCalls).toEqual([true]);
  });

  it("shows the offline indicator when offline-ready", async () => {
    __pwa.offlineReady.set(true);
    const screen = await render(PwaStatus);
    await expect.element(screen.getByText("offline_pin")).toBeInTheDocument();
    expect(
      await screen.getByText("offline_pin").element().getAttribute("title"),
    ).toBe("App can now be used offline");
  });
});
