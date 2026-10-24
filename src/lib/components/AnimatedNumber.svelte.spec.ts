import { render } from "vitest-browser-svelte";
import { describe, expect, it } from "vitest";
import AnimatedNumber from "./AnimatedNumber.svelte";

function wrappers(container: HTMLElement): HTMLDivElement[] {
  return [...container.querySelectorAll<HTMLDivElement>(".digit-wrapper")];
}

function visibleDigit(wrapper: HTMLElement): number {
  const digits = [...wrapper.children] as HTMLDivElement[];
  const idx = digits.findIndex((d) => d.style.opacity === "1");
  return Number(digits[idx]?.textContent);
}

describe("AnimatedNumber", () => {
  it("renders one wrapper per digit", async () => {
    const screen = await render(AnimatedNumber, { value: 42 });
    expect(wrappers(screen.container)).toHaveLength(2);
  });

  it("aligns the visible digit with the value", async () => {
    const screen = await render(AnimatedNumber, { value: 42 });
    const [first, second] = wrappers(screen.container);
    expect(visibleDigit(first!)).toBe(4);
    expect(visibleDigit(second!)).toBe(2);
  });

  it("grows and shrinks the digit count on value changes", async () => {
    const screen = await render(AnimatedNumber, { value: 42 });
    expect(wrappers(screen.container)).toHaveLength(2);

    await screen.rerender({ value: 100 });
    expect(wrappers(screen.container)).toHaveLength(3);
    expect(visibleDigit(wrappers(screen.container)[2]!)).toBe(0);

    await screen.rerender({ value: 7 });
    // old digits leave with a fade-out transition
    await expect
      .poll(() => wrappers(screen.container).length, { timeout: 3000 })
      .toBe(1);
    expect(visibleDigit(wrappers(screen.container)[0]!)).toBe(7);
  });
});
