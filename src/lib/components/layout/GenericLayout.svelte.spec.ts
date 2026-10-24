import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { get, writable } from "svelte/store";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  activeLayer,
  activeProfile,
  deviceLayout,
} from "$lib/serial/connection";
import { ChangeType, changes, layout, type KeyInfo } from "$lib/undo-redo";
import layoutInfoRaw from "$lib/assets/layouts/one.layout.yml";
import type { CompiledLayout } from "$lib/assets/layouts/layout.d.ts";

const layoutInfo = layoutInfoRaw as unknown as CompiledLayout;
import GenericLayoutFixture from "$lib/components/fixtures/generic-layout-fixture.svelte";

const TARGET_KEY = 51;

function seedDeviceLayout(): void {
  deviceLayout.set(
    Array.from({ length: 3 }, () =>
      Array.from({ length: 4 }, () => new Array(90).fill(0)),
    ),
  );
}

describe("GenericLayout", () => {
  beforeEach(() => {
    seedDeviceLayout();
    changes.set([]);
    activeProfile.set(0);
    activeLayer.set(0);
  });

  afterEach(() => {
    document.querySelectorAll("dialog").forEach((it) => it.remove());
  });

  it("renders one focusable group per physical key", async () => {
    await render(GenericLayoutFixture, { layoutInfo });

    const groups = document.querySelectorAll("g.key-group[data-id]");
    expect(groups.length).toBe(
      layoutInfo.keys.length + layoutInfo.fixedKeys.length,
    );
    expect(layoutInfo.keys.length).toBe(90);
    expect(groups[0]!.getAttribute("role")).toBe("button");
  });

  it("labels keys with the action assigned on the device", async () => {
    const seeded = get(deviceLayout);
    seeded[0]![0]![TARGET_KEY] = 51; // ascii "3"
    deviceLayout.set(seeded);

    await render(GenericLayoutFixture, { layoutInfo });

    const group = document.querySelector(`g[data-id="${TARGET_KEY}"]`)!;
    expect(group.textContent).toContain("3");
  });

  it("marks unapplied changes with a bullet", async () => {
    const highlight = writable(new Set<number>());
    await render(GenericLayoutFixture, { layoutInfo, highlight });

    changes.update((all) => [
      ...all,
      [
        {
          type: ChangeType.Layout,
          id: TARGET_KEY,
          layer: 0,
          profile: 0,
          action: 51,
        },
      ],
    ]);
    // store updates flush the DOM in a microtask
    await tick();

    const group = document.querySelector(`g[data-id="${TARGET_KEY}"]`)!;
    expect((get(layout)[0]![0] as KeyInfo[])[TARGET_KEY]).toEqual({
      action: 51,
      isApplied: false,
    });
    expect(group.textContent).toMatch(/3\s*•/);
  });

  it("highlights keys from the highlight context", async () => {
    const highlight = writable(new Set([TARGET_KEY]));
    await render(GenericLayoutFixture, { layoutInfo, highlight });

    const group = document.querySelector(`g[data-id="${TARGET_KEY}"]`)!;
    expect(group.classList.contains("highlight")).toBe(true);
  });

  it("moves focus between keys with the arrow keys", async () => {
    await render(GenericLayoutFixture, { layoutInfo });

    const groups = [...document.querySelectorAll("g.key-group[data-id]")];
    const first = groups[0] as SVGGElement;
    first.focus();
    expect(document.activeElement).toBe(first);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    const active = document.activeElement as SVGGElement | null;
    expect(active).toBeTruthy();
    expect(active).not.toBe(first);
    expect(active!.classList.contains("key-group")).toBe(true);
  });

  it("opens the action selector on click and selects an action", async () => {
    const screen = await render(GenericLayoutFixture, { layoutInfo });

    document
      .querySelector(`g[data-id="${TARGET_KEY}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeInTheDocument();

    // typing the action's id shows the exact-match row (the full list
    // builds a flexsearch index in the background, so allow for it)
    await userEvent.fill(page.getByRole("searchbox"), "3");
    const three = page.getByRole("button", { name: /Three/ }).first();
    // the exact-match row renders once the search box handler has run
    await expect
      .poll(() => document.querySelector("li.exact button")?.textContent, {
        timeout: 10_000,
      })
      .toContain("Three");
    await three.click();

    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

    expect(get(changes).flat()).toEqual([
      {
        type: ChangeType.Layout,
        id: TARGET_KEY,
        layer: 0,
        profile: 0,
        action: 51,
      },
    ]);
    // the selection renders as an unapplied change
    await tick();
    const group = screen.container.querySelector(`g[data-id="${TARGET_KEY}"]`)!;
    expect(group.textContent).toMatch(/3\s*•/);
  });

  it("closes the action selector via the close button", async () => {
    await render(GenericLayoutFixture, { layoutInfo });

    document
      .querySelector(`g[data-id="${TARGET_KEY}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await page.getByRole("button", { name: "close" }).click();

    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });
});
