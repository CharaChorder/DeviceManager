import { render } from "vitest-browser-svelte";
import { writable } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deviceLayout } from "$lib/serial/connection";
import type { CompiledLayoutKey } from "$lib/assets/layouts/layout.d.ts";
import KeyLayoutFixture from "$lib/components/fixtures/key-layout-fixture.svelte";

const squareKey: CompiledLayoutKey = {
  id: 5,
  shape: "square",
  cornerRadius: 0.5,
  size: [10, 10],
  pos: [0, 0],
  rotate: 0,
};

const quarterKey: CompiledLayoutKey = {
  id: 6,
  shape: "quarter-circle",
  cornerRadius: 0,
  size: [10, 10],
  pos: [0, 0],
  rotate: 90,
};

function seedDeviceLayout(code: number): void {
  deviceLayout.set(
    Array.from({ length: 3 }, () =>
      Array.from({ length: 4 }, () => {
        const layer = new Array(90).fill(0);
        return layer;
      }),
    ).map((layers) => {
      layers[0]![squareKey.id] = code;
      return layers;
    }),
  );
}

describe("KeyboardKey", () => {
  beforeEach(() => seedDeviceLayout(0));

  it("renders a focusable group labeled with the key's action", async () => {
    seedDeviceLayout(51);
    const screen = await render(KeyLayoutFixture, { key: squareKey });

    const group = screen.container.querySelector("g[data-id='5']")!;
    expect(group).toBeTruthy();
    expect(group.getAttribute("role")).toBe("button");
    expect(group.getAttribute("tabindex")).toBe(String(squareKey.id + 1));
    expect(group.textContent).toContain("3");
    expect(group.querySelector("rect")).toBeTruthy();
  });

  it("renders a path shape for quarter-circle keys", async () => {
    const screen = await render(KeyLayoutFixture, { key: quarterKey });
    const group = screen.container.querySelector("g[data-id='6']")!;
    expect(group.querySelector("path")).toBeTruthy();
    expect(group.querySelector("rect")).toBeNull();
  });

  it("highlights the key set in the highlight context", async () => {
    const highlight = writable(new Set([squareKey.id]));
    const screen = await render(KeyLayoutFixture, {
      key: squareKey,
      highlight,
    });
    const group = screen.container.querySelector("g[data-id='5']")!;
    expect(group.classList.contains("highlight")).toBe(true);
  });

  it("fades keys not present in the highlight set", async () => {
    const highlight = writable(new Set([99]));
    const screen = await render(KeyLayoutFixture, {
      key: squareKey,
      highlight,
    });
    const group = screen.container.querySelector("g[data-id='5']")!;
    expect(group.classList.contains("faded")).toBe(true);
  });

  it("forwards clicks", async () => {
    const onclick = vi.fn();
    const screen = await render(KeyLayoutFixture, {
      key: squareKey,
      onclick,
    });
    screen.container
      .querySelector("g[data-id='5']")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("leaves the label empty for unset actions", async () => {
    const screen = await render(KeyLayoutFixture, { key: squareKey });
    const group = screen.container.querySelector("g[data-id='5']")!;
    expect(group.textContent?.trim()).toBe("");
  });
});
