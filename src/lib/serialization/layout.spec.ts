import { describe, expect, it } from "vitest";
import {
  deserializeLayout,
  layoutAsUrlComponent,
  layoutFromUrlComponent,
  serializeLayout,
  type CharaLayout,
} from "./layout";
import sample from "./layout.sample.json";

function fakeLayout(): CharaLayout {
  return [0, 1, 2].map((layer) =>
    Array.from({ length: 90 }, (_, i) => layer * 1000 + i + 32),
  );
}

describe("layout serialization", () => {
  it("should round-trip a compressed layout", async () => {
    const layout = fakeLayout();
    expect(await deserializeLayout(await serializeLayout(layout))).toEqual(
      layout,
    );
  });

  it("should round-trip the sample layout", async () => {
    const layout = sample as unknown as CharaLayout;
    expect(await deserializeLayout(await serializeLayout(layout))).toEqual(
      layout,
    );
  });

  it("should split the flat action stream into three layers", async () => {
    const flat = Array.from({ length: 270 }, (_, i) => (i % 8000) + 32);
    const layers = await deserializeLayout(
      await serializeLayout(flat as unknown as CharaLayout),
    );
    expect(layers.map((it) => it.length)).toEqual([90, 90, 90]);
    expect(layers.flat()).toEqual(flat);
  });

  it("should round-trip through the url component", async () => {
    const layout = fakeLayout();
    const component = await layoutAsUrlComponent(layout);
    expect(component).not.toContain("=");
    expect(await layoutFromUrlComponent(component)).toEqual(layout);
  });
});
