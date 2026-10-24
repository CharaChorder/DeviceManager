import { describe, expect, it } from "vitest";
import { KBD_ICONS } from "./kbd-icon";
import { TextRenderer } from "./renderer";
import type { TextToken } from "../core/types";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The recorder renderer mirrors token text into SVG `<text>` nodes, keeps
 * the cursor rect over the text, and shows the currently held human keys
 * below it. Real layout, animation, and computed styles require a real
 * browser.
 */

function createRenderer() {
  const node = document.createElement("div");
  node.style.fontSize = "16px";
  const textNode = document.createTextNode("abc");
  node.appendChild(textNode);
  const svg = document.createElementNS(SVG_NS, "svg");
  node.appendChild(svg);
  document.body.appendChild(node);
  const renderer = new TextRenderer(node, svg, textNode);
  return { renderer, node, svg };
}

const token = (text: string, extra: Partial<TextToken> = {}): TextToken => ({
  stamp: 0,
  duration: 10,
  code: "KeyA",
  text,
  correct: true,
  source: "human",
  ...extra,
});

describe("TextRenderer", () => {
  it("starts with the cursor rect in the svg", () => {
    const { renderer, node, svg } = createRenderer();
    try {
      expect(svg.querySelector("rect.cursor")).toBe(renderer.cursorNode);
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("shows and hides the cursor", () => {
    const { renderer, node } = createRenderer();
    try {
      renderer.showCursor = true;
      expect(renderer.cursorNode.style.visibility).toBe("visible");
      renderer.showCursor = false;
      expect(renderer.cursorNode.style.visibility).toBe("hidden");
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("mirrors tokens into positioned svg text nodes", () => {
    const { renderer, node, svg } = createRenderer();
    try {
      renderer.text = [
        token("a"),
        token("b", { source: "ghost" }),
        token("c", { correct: false }),
      ];

      const texts = [...svg.querySelectorAll("text")];
      expect(texts.map((it) => it.textContent)).toEqual(["a", "b", "c"]);
      expect(texts[1]!.getAttribute("opacity")).toBe("0.5");
      expect(texts[2]!.hasAttribute("incorrect")).toBe(true);
      expect(texts[0]!.hasAttribute("incorrect")).toBe(false);
      // the svg box follows the laid-out element
      expect(parseFloat(svg.getAttribute("width")!) + 1).toBeGreaterThan(1);
      expect(parseFloat(texts[0]!.getAttribute("x")!)).toBeGreaterThanOrEqual(
        0,
      );
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("reuses nodes and removes tokens that are gone", () => {
    const { renderer, node, svg } = createRenderer();
    try {
      const a = token("a");
      const b = token("b");
      renderer.text = [a, b];
      const [first] = [...svg.querySelectorAll("text")];
      renderer.text = [a, b];
      expect([...svg.querySelectorAll("text")][0]).toBe(first);

      renderer.text = [a];
      expect(svg.querySelectorAll("text").length).toBe(1);
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("animates node removal when animated", async () => {
    const { renderer, node, svg } = createRenderer();
    try {
      renderer.animated = true;
      expect(renderer.animated).toBe(true);
      renderer.text = [token("a"), token("b")];
      renderer.text = [];

      await expect
        .poll(() => svg.querySelectorAll("text").length, { timeout: 3000 })
        .toBe(0);

      renderer.animated = false;
      expect(renderer.animated).toBe(false);
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("moves the cursor rect to the text offset", () => {
    const { renderer, node } = createRenderer();
    try {
      renderer.cursor = 1;
      expect(renderer.cursorNode.style.transform).toContain("translate");
      expect(renderer.cursorNode.getAttribute("height")).toBe("16px");
      expect(renderer.cursorNode.getAttribute("width")).toBe("1");

      const [x, y] = renderer.getAtRange(1);
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      // index beyond the text extends the range end
      expect(Number.isFinite(renderer.getAtRange(99)[0])).toBe(true);
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("renders held human keys with their key icons", () => {
    const { renderer, node, svg } = createRenderer();
    try {
      renderer.held = new Map([
        ["KeyA", true],
        ["KeyB", false], // robot keys are not shown
      ]);

      const texts = [...svg.querySelectorAll("text")];
      expect(texts).toHaveLength(1);
      expect(texts[0]!.textContent).toBe(KBD_ICONS.get("KeyA"));
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("fades released keys out of the svg", async () => {
    const { renderer, node, svg } = createRenderer();
    try {
      renderer.held = new Map([["KeyA", true]]);
      expect(svg.querySelectorAll("text")).toHaveLength(1);

      renderer.held = new Map();
      await expect
        .poll(() => svg.querySelectorAll("text").length, { timeout: 3000 })
        .toBe(0);
    } finally {
      renderer.destroy();
      node.remove();
    }
  });

  it("destroy removes every managed node", () => {
    const { renderer, node, svg } = createRenderer();
    renderer.text = [token("a")];
    renderer.held = new Map([["KeyA", true]]);

    renderer.destroy();
    node.remove();

    expect(svg.childNodes.length).toBe(0);
  });
});
