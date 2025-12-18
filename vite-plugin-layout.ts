import type { Plugin, Rollup } from "vite";
import type { CompiledLayout } from "./src/lib/assets/layouts/layout.d.ts";
import yaml from "js-yaml";

export interface VisualLayout {
  name: string;
  col: VisualLayoutRow[];
}

interface Positionable {
  offset: [number, number];
  rotate: number;
}

export interface VisualLayoutRow extends Positionable {
  row: Array<VisualLayoutKey | VisualLayoutSwitch>;
}

export interface VisualLayoutKey extends Positionable {
  key: number;
  size?: [number, number];
}

export interface VisualLayoutSwitch extends Positionable {
  switch: {
    n: number;
    e: number;
    w: number;
    s: number;
    d: number;
  };
}

const fileRegex = /\.(layout\.yml)$/;

export function layoutPlugin() {
  return {
    name: "charachorder-layout",
    transform(code, id) {
      if (fileRegex.test(id)) {
        return {
          code: `const data = ${JSON.stringify(compileLayout(yaml.load(code) as VisualLayout))};\nexport default data;`,
          map: null,
        } satisfies Rollup.TransformResult;
      }
      return null;
    },
  } satisfies Plugin;
}

export function compileLayout(layout: VisualLayout): CompiledLayout {
  const compiled: CompiledLayout = {
    name: layout.name,
    size: [0, 0],
    keys: [],
  };

  let y = 0;
  for (const { row, offset } of layout.col) {
    let x = offset?.[0] ?? 0;
    y += offset?.[1] ?? 0;
    let maxHeight = 0;
    for (const info of row) {
      const [ox, oy] = info.offset || [0, 0];
      const rotate = info.rotate || 0;
      if ("key" in info) {
        const [width, height] = info.size ?? [1, 1];

        compiled.keys.push({
          id: info.key,
          shape: "square",
          size: [width, height],
          pos: [x + ox, y + oy],
          cornerRadius: 0.1,
          rotate,
        });

        x += width + ox;
        maxHeight = Math.max(maxHeight, height + oy);
      } else if ("switch" in info) {
        const cx = x + ox + 1;
        const cy = y + oy + 1;
        for (const [i, id] of [
          info.switch.s,
          info.switch.w,
          info.switch.n,
          info.switch.e,
        ].entries()) {
          compiled.keys.push({
            id,
            shape: "quarter-circle",
            cornerRadius: 0,
            size: [2, 0.6],
            pos: [cx, cy],
            rotate: 90 * i + 45,
          });
        }
        if (info.switch.d !== undefined) {
          compiled.keys.push({
            id: info.switch.d,
            shape: "square",
            cornerRadius: 0.5,
            size: [0.8, 0.8],
            pos: [x + 0.6 + ox, y + 0.6 + oy],
            rotate: 0,
          });
        }

        x += 2 + ox;
        maxHeight = Math.max(maxHeight, 2 + oy);
      }
    }
    y += maxHeight;
    compiled.size[0] = Math.max(compiled.size[0], x);
  }
  compiled.size[1] = y;

  return compiled;
}
