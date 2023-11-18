import { c as create_ssr_component, a as subscribe, b as add_attribute, e as each, d as escape, v as validate_component } from "../../../chunks/ssr.js";
import { a as serialPort, f as serialLog } from "../../../chunks/connection.js";
const Terminal_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: 'form.svelte-vncpgh{position:relative;contain:strict;overflow:hidden;display:flex;flex-direction:column;width:100%;height:100%;font-family:"Noto Sans Mono", monospace;font-size:0.75rem;color:var(--md-sys-color-on-secondary);border-radius:16px}fieldset.svelte-vncpgh::before{content:"$";position:absolute;bottom:8px;left:8px;font-weight:900}input.svelte-vncpgh{width:100%;margin-block-start:-16px;padding:8px;padding-block-start:24px;padding-inline-start:calc(8px + 1.5ch);font-family:"Noto Sans Mono", monospace;font-weight:600;color:var(--md-sys-color-on-secondary);-webkit-appearance:none;-moz-appearance:none;appearance:none;background:var(--md-sys-color-secondary);border:none}.io.svelte-vncpgh{--scrollbar-color:var(--md-sys-color-secondary);z-index:1;overflow-y:auto;flex:1;padding:12px;color:var(--md-sys-color-on-secondary-container);background:var(--md-sys-color-secondary-container);border-radius:0 0 16px 16px}.svelte-vncpgh:focus-visible{outline:none}fieldset.svelte-vncpgh{all:unset;position:relative;display:block;opacity:0.8;transition:opacity 250ms ease}fieldset.svelte-vncpgh:focus-within{opacity:1}.anchor.svelte-vncpgh{overflow-anchor:auto;height:1px}code.svelte-vncpgh,samp.svelte-vncpgh,p.svelte-vncpgh{display:block;overflow-anchor:none;margin-block:0.15rem}p.svelte-vncpgh{display:flex;justify-content:center;margin-block-end:1rem;padding:0.25rem;color:var(--md-sys-color-on-secondary);background:var(--md-sys-color-secondary);border-radius:8px}code.svelte-vncpgh::before{content:"> ";margin-block-end:0.25rem;font-weight:900;color:var(--md-sys-color-primary)}.svelte-vncpgh::-moz-selection{color:var(--md-sys-color-background);background:var(--md-sys-color-on-background)}.svelte-vncpgh::selection{color:var(--md-sys-color-background);background:var(--md-sys-color-on-background)}@keyframes svelte-vncpgh-blink{100%,60%{opacity:1}40%,0%{opacity:0}}',
  map: null
};
const Terminal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_serialPort;
  let $serialLog, $$unsubscribe_serialLog;
  $$unsubscribe_serialPort = subscribe(serialPort, (value2) => value2);
  $$unsubscribe_serialLog = subscribe(serialLog, (value2) => $serialLog = value2);
  let value;
  let io;
  $$result.css.add(css$1);
  $$unsubscribe_serialPort();
  $$unsubscribe_serialLog();
  return `<form class="svelte-vncpgh"><div class="io svelte-vncpgh"${add_attribute("this", io, 0)}>${each($serialLog, ({ type, value: value2 }) => {
    return `${type === "input" ? `<code class="svelte-vncpgh">${escape(value2)}</code>` : `${type === "output" ? `<samp class="svelte-vncpgh">${escape(value2)}</samp>` : `<p class="svelte-vncpgh">${escape(value2)}</p>`}`}`;
  })} <div class="anchor svelte-vncpgh"></div></div> <fieldset class="svelte-vncpgh"><input class="svelte-vncpgh"${add_attribute("value", value, 0)}></fieldset> </form>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "section.svelte-1rcvi4q{contain:size;overflow:hidden;display:flex;flex-direction:column;flex-grow:1;gap:16px;width:min(100%, 28cm);height:100%}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<section class="terminal svelte-1rcvi4q">${validate_component(Terminal, "Terminal").$$render($$result, {}, {}, {})} </section>`;
});
export {
  Page as default
};
