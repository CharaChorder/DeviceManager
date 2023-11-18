import { c as create_ssr_component, a as subscribe, g as getContext, e as each, b as add_attribute, k as add_styles, d as escape, v as validate_component, i as is_promise, n as noop, s as setContext } from "../../../../chunks/ssr.js";
import "../../../../chunks/share.js";
import { a as serialPort } from "../../../../chunks/connection.js";
/* empty css                                                        */import "hotkeys-js";
import { K as KEYMAP_CODES } from "../../../../chunks/keymap-codes.js";
import "flexsearch";
/* empty css                                                               */import "../../../../chunks/i18n-svelte.js";
import { l as layout } from "../../../../chunks/undo-redo.js";
import { w as writable } from "../../../../chunks/index2.js";
function compileLayout(layout2) {
  const compiled = {
    name: layout2.name,
    size: [0, 0],
    keys: []
  };
  let y = 0;
  for (const { row, offset } of layout2.col) {
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
          rotate
        });
        x += width + ox;
        maxHeight = Math.max(maxHeight, height + oy);
      } else if ("switch" in info) {
        const cx = x + ox + 1;
        const cy = y + oy + 1;
        for (const [i, id] of [info.switch.s, info.switch.w, info.switch.n, info.switch.e].entries()) {
          compiled.keys.push({
            id,
            shape: "quarter-circle",
            cornerRadius: 0,
            size: [2, 0.6],
            pos: [cx, cy],
            rotate: 90 * i + 45
          });
        }
        compiled.keys.push({
          id: info.switch.d,
          shape: "square",
          cornerRadius: 0.5,
          size: [0.8, 0.8],
          pos: [x + 0.6 + ox, y + 0.6 + oy],
          rotate: 0
        });
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
const KeyText_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: "text.svelte-5uyll2{will-change:translate, scale;transform-origin:center;transform-box:fill-box;transition:fill 10ms ease, opacity 200ms ease, translate 200ms ease, scale 200ms ease}",
  map: null
};
const KeyText = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $layout, $$unsubscribe_layout;
  let $activeLayer, $$unsubscribe_activeLayer;
  $$unsubscribe_layout = subscribe(layout, (value) => $layout = value);
  const { fontSize, margin, inactiveOpacity, inactiveScale, iconFontSize } = getContext("visual-layout-config");
  const activeLayer = getContext("active-layer");
  $$unsubscribe_activeLayer = subscribe(activeLayer, (value) => $activeLayer = value);
  let { key } = $$props;
  let { fontSizeMultiplier = 1 } = $$props;
  let { middle } = $$props;
  let { pos } = $$props;
  let { rotate } = $$props;
  let { positions } = $$props;
  if ($$props.key === void 0 && $$bindings.key && key !== void 0)
    $$bindings.key(key);
  if ($$props.fontSizeMultiplier === void 0 && $$bindings.fontSizeMultiplier && fontSizeMultiplier !== void 0)
    $$bindings.fontSizeMultiplier(fontSizeMultiplier);
  if ($$props.middle === void 0 && $$bindings.middle && middle !== void 0)
    $$bindings.middle(middle);
  if ($$props.pos === void 0 && $$bindings.pos && pos !== void 0)
    $$bindings.pos(pos);
  if ($$props.rotate === void 0 && $$bindings.rotate && rotate !== void 0)
    $$bindings.rotate(rotate);
  if ($$props.positions === void 0 && $$bindings.positions && positions !== void 0)
    $$bindings.positions(positions);
  $$result.css.add(css$4);
  $$unsubscribe_layout();
  $$unsubscribe_activeLayer();
  return `${each(positions, (position, layer) => {
    let { action: actionId, isApplied } = $layout[layer][key.id] ?? { action: 0, isApplied: true }, { code, icon, id } = KEYMAP_CODES[actionId] ?? { code: actionId }, isActive = layer === $activeLayer, direction = [
      (middle[0] - margin * 3) / position[0],
      (middle[1] - margin * 3) / position[1]
    ];
    return `    <text${add_attribute(
      "fill",
      isApplied ? "currentcolor" : "var(--md-sys-color-primary)",
      0
    )}${add_attribute("font-weight", isApplied ? "" : "bold", 0)} text-anchor="middle" alignment-baseline="central"${add_attribute("x", pos[0] + middle[0] + (isApplied ? 0 : fontSize / 3), 0)}${add_attribute("y", pos[1] + middle[1], 0)}${add_attribute("font-size", fontSizeMultiplier * (icon ? iconFontSize : fontSize), 0)}${add_attribute("font-family", icon ? "Material Symbols Rounded" : void 0, 0)}${add_attribute("opacity", isActive ? 1 : inactiveOpacity, 0)} class="svelte-5uyll2"${add_styles({
      "scale": isActive ? 1 : inactiveScale,
      "translate": isActive ? "0 0 0" : `${direction[0]}px ${direction[1]}px 0`,
      "rotate": `${rotate}deg`
    })}>${code !== 0 ? `${escape(icon || id || `0x${code.toString(16)}`)}` : ``}${!isApplied ? `<tspan>•</tspan>` : ``}</text>`;
  })}`;
});
const KeyboardKey_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: "rect.svelte-pazmop.svelte-pazmop{transform-origin:center;transform-box:fill-box}g.svelte-pazmop.svelte-pazmop{transform-origin:top left;transform-box:fill-box}path.svelte-pazmop.svelte-pazmop,rect.svelte-pazmop.svelte-pazmop{fill:var(--md-sys-color-background);fill-opacity:0;stroke:currentcolor}path.svelte-pazmop.svelte-pazmop{fill:currentcolor;fill-opacity:0;stroke-opacity:0.3}g.svelte-pazmop.svelte-pazmop:hover{cursor:default;opacity:0.6;transition:opacity 200ms ease}g.svelte-pazmop.svelte-pazmop:focus-within{color:var(--md-sys-color-primary);outline:none}g.svelte-pazmop:focus-within>path.svelte-pazmop,g.svelte-pazmop:focus-within>rect.svelte-pazmop{fill:currentcolor;fill-opacity:0.2}",
  map: null
};
const KeyboardKey = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let posX;
  let posY;
  let sizeX;
  let sizeY;
  const { scale, margin, strokeWidth } = getContext("visual-layout-config");
  let { i } = $$props;
  let { key } = $$props;
  if ($$props.i === void 0 && $$bindings.i && i !== void 0)
    $$bindings.i(i);
  if ($$props.key === void 0 && $$bindings.key && key !== void 0)
    $$bindings.key(key);
  $$result.css.add(css$3);
  posX = key.pos[0] * scale;
  posY = key.pos[1] * scale;
  sizeX = key.size[0] * scale;
  sizeY = key.size[1] * scale;
  return `<g class="key-group svelte-pazmop" role="button"${add_attribute("tabindex", i + 1, 0)}>${key.shape === "square" ? `<rect${add_attribute("x", posX + margin, 0)}${add_attribute("y", posY + margin, 0)}${add_attribute("rx", key.cornerRadius * scale, 0)}${add_attribute("width", sizeX - margin * 2, 0)}${add_attribute("height", sizeY - margin * 2, 0)}${add_attribute("stroke-width", strokeWidth, 0)} class="svelte-pazmop"></rect> ${validate_component(KeyText, "KeyText").$$render(
    $$result,
    {
      key,
      middle: [sizeX / 2, sizeY / 2],
      pos: [posX, posY],
      rotate: -key.rotate,
      positions: [[-1, 1], [-1, -1], [1, -1]]
    },
    {},
    {}
  )}` : `${key.shape === "quarter-circle" ? (() => {
    let innerMargin = margin / 2, r1 = sizeX / 2 - margin, p1 = r1 - innerMargin, r2 = r1 - sizeY + innerMargin * 2, p2 = r2 - innerMargin, multiplier = 1.25;
    return `      <g class="svelte-pazmop"${add_styles({
      "transform": `rotateZ(${key.rotate}deg) translate(${innerMargin}px, ${innerMargin}px)`
    })}><path d="${"M" + escape(posX + p1, true) + "," + escape(posY, true) + " a" + escape(r1, true) + "," + escape(r1, true) + " 0 0,1 " + escape(-p1, true) + "," + escape(p1, true) + " l0," + escape(-(p1 - p2), true) + " a" + escape(r2, true) + "," + escape(r2, true) + " 0 0,0 " + escape(p2, true) + "," + escape(-p2, true) + "z"}" class="svelte-pazmop"></path>${validate_component(KeyText, "KeyText").$$render(
      $$result,
      {
        key,
        middle: [sizeY - margin * 2, sizeY - margin * 2],
        pos: [posX, posY],
        rotate: -key.rotate,
        fontSizeMultiplier: multiplier,
        positions: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5]]
      },
      {},
      {}
    )}</g>`;
  })() : ``}`}</g>`;
});
const GenericLayout_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: 'svg.svelte-1nciqmp{overflow:visible;grid-area:"d";width:min(100%, 35cm);max-height:calc(100% - 170px)}',
  map: null
};
const GenericLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let layoutInfo;
  const { scale, margin, strokeWidth, fontSize, iconFontSize } = getContext("visual-layout-config");
  getContext("active-layer");
  let { visualLayout } = $$props;
  let groupParent;
  if ($$props.visualLayout === void 0 && $$bindings.visualLayout && visualLayout !== void 0)
    $$bindings.visualLayout(visualLayout);
  $$result.css.add(css$2);
  layoutInfo = compileLayout(visualLayout);
  return ` <svg class="print svelte-1nciqmp" viewBox="${"0 0 " + escape(layoutInfo.size[0] * scale, true) + " " + escape(layoutInfo.size[1] * scale, true)}"${add_attribute("this", groupParent, 0)}>${each(layoutInfo.keys, (key, i) => {
    return `${validate_component(KeyboardKey, "KeyboardKey").$$render($$result, { i, key }, {}, {})}`;
  })}</svg>`;
});
const Layout_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".container.svelte-11vitej{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;margin-bottom:96px}fieldset.svelte-11vitej{position:relative;display:flex;align-items:center;justify-content:center;padding:0;border:none}button.icon.svelte-11vitej{cursor:pointer;z-index:1;font-size:24px;color:var(--md-sys-color-on-surface-variant);background:var(--md-sys-color-surface-variant);border:none;transition:all 250ms ease}button.icon.svelte-11vitej:nth-child(2){z-index:2;aspect-ratio:1;font-size:32px;border-radius:50%;outline:8px solid var(--md-sys-color-background)}button.icon.svelte-11vitej:first-child,button.icon.svelte-11vitej:last-child{aspect-ratio:unset;height:unset}button.icon.svelte-11vitej:first-child{padding-inline:4px 16px;border-radius:16px 0 0 16px}button.icon.svelte-11vitej:last-child{padding-inline:16px 4px;border-radius:0 16px 16px 0}button.icon.active.svelte-11vitej{font-weight:900;color:var(--md-sys-color-on-tertiary);background:var(--md-sys-color-tertiary)}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let device;
  let $serialPort, $$unsubscribe_serialPort;
  let $activeLayer, $$unsubscribe_activeLayer;
  $$unsubscribe_serialPort = subscribe(serialPort, (value) => $serialPort = value);
  const activeLayer = getContext("active-layer");
  $$unsubscribe_activeLayer = subscribe(activeLayer, (value) => $activeLayer = value);
  const layers = [
    ["Numeric Layer", "123", 1],
    ["Primary Layer", "abc", 0],
    ["Function Layer", "function", 2]
  ];
  const layouts = {
    ONE: () => import("../../../../chunks/one.js").then((it) => it.default),
    LITE: () => import("../../../../chunks/lite.js").then((it) => it.default),
    X: () => import("../../../../chunks/103-key.js").then((it) => it.default)
  };
  $$result.css.add(css$1);
  device = $serialPort?.device ?? "ONE";
  $$unsubscribe_serialPort();
  $$unsubscribe_activeLayer();
  return `<div class="container svelte-11vitej"><fieldset class="svelte-11vitej">${each(layers, ([title, icon, value]) => {
    return `<button class="${["icon svelte-11vitej", $activeLayer === value ? "active" : ""].join(" ").trim()}">${escape(icon)} </button>`;
  })}</fieldset> ${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function(visualLayout) {
      return ` ${validate_component(GenericLayout, "GenericLayout").$$render($$result, { visualLayout }, {}, {})} `;
    }(__value);
  }(layouts[device]())} </div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "section.svelte-160295n{display:flex;align-items:center;justify-content:center;width:100%;height:100%}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_layout;
  $$unsubscribe_layout = subscribe(layout, (value) => value);
  setContext("visual-layout-config", {
    scale: 50,
    inactiveScale: 0.5,
    inactiveOpacity: 0.4,
    strokeWidth: 1,
    margin: 5,
    fontSize: 9,
    iconFontSize: 14
  });
  setContext("active-layer", writable(0));
  $$result.css.add(css);
  $$unsubscribe_layout();
  return ` <section class="svelte-160295n">${validate_component(Layout, "Layout").$$render($$result, {}, {}, {})} </section>`;
});
export {
  Page as default
};
