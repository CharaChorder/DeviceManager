import type { Action } from "svelte/action";
import { changes, ChangeType, settings } from "$lib/undo-redo";
import { activeProfile } from "./serial/connection";
import { combineLatest, map } from "rxjs";
import { fromReadable } from "./util/from-readable";
import { get } from "svelte/store";

/**
 * https://gist.github.com/mjackson/5311256
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;

  const d = max - min;
  const s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [Math.floor(h * 0xffff), Math.floor(s * 0xff), Math.floor(v * 0xff)];
}

/**
 * https://gist.github.com/mjackson/5311256
 */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h /= 0xffff;
  s /= 0xff;
  v /= 0xff;

  let r = 0;
  let g = 0;
  let b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [Math.floor(r * 0xff), Math.floor(g * 0xff), Math.floor(b * 0xff)];
}

export const setting: Action<
  HTMLInputElement | HTMLSelectElement,
  { id: number; inverse?: number; scale?: number }
> = function (
  node: HTMLInputElement | HTMLSelectElement,
  { id, inverse, scale },
) {
  node.setAttribute("disabled", "");
  const type = node.getAttribute("type") as
    | "number"
    | "checkbox"
    | "range"
    | "color";
  const isColor = type === "color";
  const isNumeric =
    type === "number" || type === "range" || node instanceof HTMLSelectElement;
  const min = node.hasAttribute("min")
    ? Number(node.getAttribute("min"))
    : undefined;
  const max = node.hasAttribute("max")
    ? Number(node.getAttribute("max"))
    : undefined;

  const subscription = combineLatest([
    fromReadable(settings),
    fromReadable(activeProfile),
  ])
    .pipe(map(([settings, profile]) => settings[profile]!))
    .subscribe(async (settings) => {
      if (id in settings) {
        const { value, isApplied } = settings[id]!;
        if (isNumeric) {
          node.value = (
            inverse !== undefined
              ? inverse / value
              : scale !== undefined
                ? scale * value
                : value
          ).toString();
        } else if (isColor) {
          const rgb = hsvToRgb(
            settings[id]!.value,
            settings[id + 1]!.value,
            settings[id + 2]!.value,
          );
          node.value = `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
        } else {
          node.checked = value !== 0;
        }
        if (isApplied) {
          node.classList.remove("pending-changes");
        } else {
          node.classList.add("pending-changes");
        }
        node.removeAttribute("disabled");
      } else {
        node.setAttribute("disabled", "");
      }
    });

  async function listener() {
    let value: number;
    if (isNumeric) {
      value = Number(node.value);
      if (Number.isNaN(value)) return;
      if (min !== undefined) value = Math.max(min, value);
      if (max !== undefined) value = Math.min(max, value);
      value = Math.floor(
        inverse !== undefined
          ? inverse / value
          : scale !== undefined
            ? value / scale
            : value,
      );
    } else if (isColor) {
      const r = parseInt(node.value.slice(1, 3), 16);
      const g = parseInt(node.value.slice(3, 5), 16);
      const b = parseInt(node.value.slice(5, 7), 16);
      const hsv = rgbToHsv(r, g, b);
      changes.update((changes) => {
        changes.push(
          hsv.map((value, i) => ({
            type: ChangeType.Setting,
            id: id + i,
            setting: value,
            profile: get(activeProfile),
          })),
        );
        return changes;
      });
      return;
    } else {
      value = node.checked ? 1 : 0;
    }

    changes.update((changes) => {
      changes.push([
        {
          type: ChangeType.Setting,
          id: id,
          setting: value,
          profile: get(activeProfile),
        },
      ]);
      return changes;
    });
  }

  node.addEventListener("change", listener);

  return {
    destroy() {
      node.removeEventListener("change", listener);
      subscription.unsubscribe();
    },
  };
};
