import type { TextToken } from "../core/types";
import { KBD_ICONS } from "./kbd-icon";

export class TextRenderer {
  shinyChords = true;

  shiny: number[] | undefined;

  readonly cursorNode: SVGRectElement;

  private readonly nodes = new Map<TextToken, SVGTextElement>();

  private readonly heldNodes = new Map<string, SVGTextElement>();

  private readonly occupiedHeld: Array<boolean | undefined> = [];

  private readonly occupied: number[] = [];

  animationOptions: KeyframeAnimationOptions = {
    duration: 100,
    easing: "ease",
  };

  heldKeySize = 0.8;

  ghostText = "";

  constructor(
    readonly node: HTMLElement,
    readonly svg: SVGSVGElement,
    readonly textNode: Text,
  ) {
    this.cursorNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    this.cursorNode.setAttribute("x", "0");
    this.cursorNode.setAttribute("y", "0");
    this.svg.appendChild(this.cursorNode);
  }

  set showCursor(value: boolean) {
    this.cursorNode.style.visibility = value ? "visible" : "hidden";
  }

  getAtRange(i: number): [number, number] {
    const range = document.createRange();
    const rangeIndex = Math.max(0, Math.min(i, this.textNode.length - 1));
    range.setStart(this.textNode, rangeIndex);
    range.setEnd(
      this.textNode,
      this.textNode.length === 0 ? 0 : rangeIndex + 1,
    );
    const charBounds = range.getBoundingClientRect();
    return [
      i > this.textNode.length - 1
        ? charBounds.x + charBounds.width
        : charBounds.x,
      charBounds.y + charBounds.height / 2 + 1,
    ];
  }

  set held(keys: Map<string, boolean>) {
    const prev = new Set(this.heldNodes.keys());
    const fontSize = getComputedStyle(this.node).fontSize;

    for (const [code, isHuman] of keys) {
      if (!isHuman) continue;
      prev.delete(code);
      let node = this.heldNodes.get(code);
      if (!node) {
        let i = this.occupiedHeld.findIndex((it) => it === undefined);
        if (i === -1) {
          i = this.occupiedHeld.length;
          this.occupiedHeld.push(true);
        } else {
          this.occupiedHeld[i] = true;
        }
        node = document.createElementNS("http://www.w3.org/2000/svg", "text");
        node.textContent = KBD_ICONS.get(code) ?? null;
        node.setAttribute("i", i.toString());
        this.heldNodes.set(code, node);
        node.style.transform = `${this.cursorNode.style.transform} translateY(calc(${fontSize} * ${
          i + 1.5
        }))`;
        node.style.fontSize = `calc(${fontSize} * ${this.heldKeySize})`;
        this.svg.appendChild(node);
        node
          .animate(
            [
              {
                transform: `translateY(calc(-${fontSize} * ${this.heldNodes.size})) scale(0)`,
              },
              { transform: "translateY(0px) scale(1)" },
            ],
            { duration: 200, composite: "add", easing: "ease-out" },
          )
          .play();
      }
    }

    for (const code of prev) {
      const node = this.heldNodes.get(code);
      if (!node) continue;
      this.heldNodes.delete(code);

      this.occupiedHeld[Number(node.getAttribute("i"))] = undefined;
      node
        .animate(
          [
            { transform: "translateX(0px)" },
            { transform: "translateX(-10px)" },
          ],
          {
            duration: 500,
            composite: "accumulate",
            easing: "ease-in",
          },
        )
        .play();
      const animation = node.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 500,
        easing: "ease-in",
      });
      animation.onfinish = () => {
        node.remove();
      };
      animation.play();
    }
  }

  get animated(): boolean {
    return this.cursorNode.classList.contains("animated");
  }

  set animated(value: boolean) {
    if (value) {
      this.cursorNode.classList.add("animated");
    } else {
      this.cursorNode.classList.remove("animated");
    }
  }

  set cursor(cursor: number) {
    const bounds = this.node.getBoundingClientRect();
    const style = getComputedStyle(this.node);

    const pos = this.getAtRange(cursor);
    const x = pos[0] - bounds.x;
    const y = pos[1] - bounds.y;

    this.cursorNode.setAttribute("height", style.fontSize);
    this.cursorNode.setAttribute("width", "1");

    this.cursorNode.style.transform = `translate(${x}px, calc(${y}px - ${style.fontSize} / 2))`;
  }

  set text(text: TextToken[]) {
    const prev = new Set(this.nodes.keys());

    const bounds = this.node.getBoundingClientRect();

    this.svg.setAttribute("width", bounds.width.toFixed(2));
    this.svg.setAttribute("height", bounds.height.toFixed(2));
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${bounds.width.toFixed(2)} ${bounds.height.toFixed(2)}`,
    );

    text.forEach((token, i) => {
      prev.delete(token);
      let node = this.nodes.get(token);

      const pos = this.getAtRange(i);
      const x = pos[0] - bounds.x;
      const y = pos[1] - bounds.y;
      const xStr = x.toFixed(2);
      const yStr = y.toFixed(2);

      if (!node) {
        node = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.nodes.set(token, node);
        this.svg.appendChild(node);
        node.setAttribute("x", xStr);
        node.setAttribute("y", yStr);
        node.setAttribute("i", i.toString());
        if (token.source === "ghost") {
          node.setAttribute("opacity", "0.5");
        }
        this.occupied[i] ??= 0;
        if (this.animated) {
          if (this.occupied[i] > 0) {
            node
              .animate([{ opacity: 0 }, { opacity: 1 }], {
                ...this.animationOptions,
                easing: "ease-out",
              })
              .play();
          } else {
            node
              .animate(
                [
                  { opacity: 0, transform: "translateY(10px)" },
                  { opacity: 1, transform: "translateY(0px)" },
                ],
                { ...this.animationOptions, easing: "ease-out" },
              )
              .play();
          }
        }
        this.occupied[i]++;
      }

      if (!token.correct) {
        node.setAttribute("incorrect", "");
      } else {
        node.removeAttribute("incorrect");
      }

      const prevX = node.getAttribute("x");
      if (prevX && prevX !== xStr) {
        const prev = parseFloat(prevX);
        node.setAttribute("x", xStr);
        /*if (this.animated) {
					node.animate(
						[{ transform: `translateX(${prev - x}px)` }, { transform: `translateX(0px)` }],
						this.animationOptions
					);
				}*/
      }
      const prevY = node.getAttribute("y");
      if (prevY && prevY !== yStr) {
        const prev = parseFloat(prevY);
        node.setAttribute("y", yStr);
        /*if (this.animated) {
					node.animate(
						[{ transform: `translateY(${prev - y}px)` }, { transform: `translateY(0px)` }],
						this.animationOptions
					);
				}*/
      }
      if (node.textContent !== token.text) {
        node.textContent = token.text;
      }
    });

    for (const token of prev) {
      const node = this.nodes.get(token)!;
      const i = parseInt(node.getAttribute("i")!);
      this.nodes.delete(token);
      if (this.animated) {
        const animation = node.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          this.animationOptions,
        );
        setTimeout(() => {
          if (this.occupied[i] === 1) {
            node
              .animate(
                [
                  { transform: "translateY(0px)" },
                  { transform: "translateY(10px)" },
                ],
                this.animationOptions,
              )
              .play();
          }
        }, 10);
        animation.onfinish = () => {
          node.remove();
          this.occupied[i]!--;
        };
        animation.play();
      } else {
        node.remove();
        this.occupied[i]!--;
      }
    }
  }

  private isShiny(char: TextToken, index: number) {
    return (
      this.shiny?.includes(index) ||
      (this.shinyChords && char.source === "robot")
    );
  }
}
