import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { get } from "svelte/store";
import SettingInputFixture from "./components/fixtures/setting-input-fixture.svelte";
import { activeProfile, deviceSettings } from "$lib/serial/connection";
import { ChangeType, changes } from "$lib/undo-redo";

/**
 * `use:setting` binding tests. The action mirrors the derived `settings`
 * store (device values + overlay) onto an input and records user edits as
 * `Setting` changes in the undo-redo queue.
 */

function profile(values: Record<number, number>): number[][] {
  return [Array.from({ length: 40 }, (_, i) => values[i] ?? 0)];
}

beforeEach(() => {
  changes.set([]);
  activeProfile.set(0);
});

describe("use:setting (numeric)", () => {
  it("mirrors the device value and enables the input", async () => {
    deviceSettings.set(profile({ 21: 5 }));
    const screen = await render(SettingInputFixture, { id: 21 });

    const input = (await screen
      .getByRole("spinbutton")
      .element()) as HTMLInputElement;
    expect(input.value).toBe("5");
    expect(input.disabled).toBe(false);
  });

  it("stays disabled while the id is not in the profile", async () => {
    deviceSettings.set([Array.from({ length: 10 }, () => 0)]);
    const screen = await render(SettingInputFixture, { id: 21 });

    const input = (await screen
      .getByRole("spinbutton")
      .element()) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("scales and inverts the displayed value", async () => {
    deviceSettings.set(profile({ 21: 3, 22: 40 }));
    const scaled = await render(SettingInputFixture, { id: 21, scale: 10 });
    const inverted = await render(SettingInputFixture, {
      id: 22,
      inverse: 1000,
    });

    expect(scaled.container.querySelector("input")!.value).toBe("30");
    expect(inverted.container.querySelector("input")!.value).toBe("25");
  });

  it("writes a setting change on input change", async () => {
    deviceSettings.set(profile({ 21: 5 }));
    const screen = await render(SettingInputFixture, { id: 21 });
    const input = (await screen
      .getByRole("spinbutton")
      .element()) as HTMLInputElement;

    input.value = "9";
    input.dispatchEvent(new Event("change"));

    expect(get(changes)).toEqual([
      [{ type: ChangeType.Setting, id: 21, setting: 9, profile: 0 }],
    ]);
    await expect
      .poll(() => input.classList.contains("pending-changes"))
      .toBe(true);
  });

  it("clamps to min/max and floors the result", async () => {
    deviceSettings.set(profile({ 21: 5 }));
    const screen = await render(SettingInputFixture, {
      id: 21,
      min: 2,
      max: 7,
    });
    const input = (await screen
      .getByRole("spinbutton")
      .element()) as HTMLInputElement;

    input.value = "10";
    input.dispatchEvent(new Event("change"));
    input.value = "1";
    input.dispatchEvent(new Event("change"));

    // last change: "1" clamped up to min 2; the one before: "10" capped to 7
    expect(get(changes).at(-1)).toEqual([
      { type: ChangeType.Setting, id: 21, setting: 2, profile: 0 },
    ]);
    expect(get(changes).at(-2)).toEqual([
      { type: ChangeType.Setting, id: 21, setting: 7, profile: 0 },
    ]);
  });
});

describe("use:setting (checkbox)", () => {
  it("mirrors checked state and writes 0/1", async () => {
    deviceSettings.set(profile({ 21: 1 }));
    const screen = await render(SettingInputFixture, {
      id: 21,
      type: "checkbox",
    });
    const input = (await screen
      .getByRole("checkbox")
      .element()) as HTMLInputElement;

    expect(input.checked).toBe(true);

    input.checked = false;
    input.dispatchEvent(new Event("change"));

    expect(get(changes)).toEqual([
      [{ type: ChangeType.Setting, id: 21, setting: 0, profile: 0 }],
    ]);
  });
});

describe("use:setting (color)", () => {
  it("converts the hsv triple to a hex color", async () => {
    deviceSettings.set(profile({ 16: 0xffff, 17: 0xff, 18: 0xff }));
    const screen = await render(SettingInputFixture, { id: 16, type: "color" });

    const input = screen.container.querySelector("input")!;
    expect(input.value).toBe("#ff0000");
  });

  it("converts edits back to hsv changes", async () => {
    deviceSettings.set(profile({ 16: 0xffff, 17: 0xff, 18: 0xff }));
    const screen = await render(SettingInputFixture, { id: 16, type: "color" });
    const input = screen.container.querySelector("input")!;

    input.value = "#00ff00";
    input.dispatchEvent(new Event("change"));

    // green: h = 120deg → 1/3 of 0xffff, full saturation and value
    expect(get(changes)).toEqual([
      [
        { type: ChangeType.Setting, id: 16, setting: 21845, profile: 0 },
        { type: ChangeType.Setting, id: 17, setting: 255, profile: 0 },
        { type: ChangeType.Setting, id: 18, setting: 255, profile: 0 },
      ],
    ]);
  });
});

describe("use:setting (profile switching)", () => {
  it("follows the active profile", async () => {
    deviceSettings.set([
      Array.from({ length: 40 }, (_, i) => (i === 21 ? 5 : 0)),
      Array.from({ length: 40 }, (_, i) => (i === 21 ? 33 : 0)),
    ]);
    const screen = await render(SettingInputFixture, { id: 21 });
    const input = (await screen
      .getByRole("spinbutton")
      .element()) as HTMLInputElement;

    expect(input.value).toBe("5");

    activeProfile.set(1);
    await expect.poll(() => input.value).toBe("33");

    // changes are recorded against the active profile
    input.value = "40";
    input.dispatchEvent(new Event("change"));
    expect(get(changes).at(-1)).toEqual([
      { type: ChangeType.Setting, id: 21, setting: 40, profile: 1 },
    ]);
  });
});
