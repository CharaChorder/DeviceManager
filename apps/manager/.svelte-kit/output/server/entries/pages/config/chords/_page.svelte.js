import { f as assign, h as is_function, c as create_ssr_component, d as escape, e as each, v as validate_component, b as add_attribute, a as subscribe, j as createEventDispatcher, o as onDestroy, s as setContext } from "../../../../chunks/ssr.js";
import { K as KEYMAP_CODES } from "../../../../chunks/keymap-codes.js";
import Index from "flexsearch";
import { L as LL } from "../../../../chunks/i18n-svelte.js";
/* empty css                                                        */import "hotkeys-js";
import { a as chords } from "../../../../chunks/undo-redo.js";
import { d as derived, w as writable } from "../../../../chunks/index2.js";
/* empty css                                                               */function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function crossfade({ fallback, ...defaults }) {
  const to_receive = /* @__PURE__ */ new Map();
  const to_send = /* @__PURE__ */ new Map();
  function crossfade2(from_node, node, params) {
    const {
      delay = 0,
      duration = (d2) => Math.sqrt(d2) * 30,
      easing = cubicOut
    } = assign(assign({}, defaults), params);
    const from = from_node.getBoundingClientRect();
    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const dw = from.width / to.width;
    const dh = from.height / to.height;
    const d = Math.sqrt(dx * dx + dy * dy);
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    const opacity = +style.opacity;
    return {
      delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing,
      css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
    };
  }
  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, node);
      return () => {
        if (counterparts.has(params.key)) {
          const other_node = counterparts.get(params.key);
          counterparts.delete(params.key);
          return crossfade2(other_node, node, params);
        }
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }
  return [transition(to_send, to_receive, false), transition(to_receive, to_send, true)];
}
const Action_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: "kbd.svelte-pv7xjy:not(.inline-kbd){height:24px;padding-block:auto;transition:color 250ms ease}.inline-kbd.svelte-pv7xjy{margin-inline-end:2px}span+.inline-kbd.svelte-pv7xjy{margin-inline-start:2px}",
  map: null
};
const Action = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let info;
  let { action } = $$props;
  let { display = "inline-keys" } = $$props;
  if ($$props.action === void 0 && $$bindings.action && action !== void 0)
    $$bindings.action(action);
  if ($$props.display === void 0 && $$bindings.display && display !== void 0)
    $$bindings.display(display);
  $$result.css.add(css$4);
  info = typeof action === "number" ? KEYMAP_CODES[action] ?? { code: action } : action;
  return `${display === "keys" ? `<kbd class="${["svelte-pv7xjy", !!info.icon ? "icon" : ""].join(" ").trim()}">${escape(info.icon ?? info.id ?? `0x${info.code.toString(16)}`)}</kbd>` : `${display === "inline-keys" ? `${!info.icon && info.id?.length === 1 ? `<span>${escape(info.id)}</span>` : `<kbd class="${["inline-kbd svelte-pv7xjy", !!info.icon ? "icon" : ""].join(" ").trim()}">${escape(info.icon ?? info.id ?? `0x${info.code.toString(16)}`)}</kbd>`}` : ``}`}`;
});
const ActionString = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { actions } = $$props;
  let { display = "inline-keys" } = $$props;
  if ($$props.actions === void 0 && $$bindings.actions && actions !== void 0)
    $$bindings.actions(actions);
  if ($$props.display === void 0 && $$bindings.display && display !== void 0)
    $$bindings.display(display);
  return `${each(actions, (action, i) => {
    return `${validate_component(Action, "Action").$$render($$result, { action, display }, {}, {})}`;
  })}`;
});
const ChordPhraseEdit_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: 'sup.svelte-niexr.svelte-niexr{translate:0 -40%;opacity:0;transition:opacity 250ms ease}.cursor.svelte-niexr.svelte-niexr{position:absolute;transform:translateX(-50%);translate:0 0;width:2px;height:100%;background:var(--md-sys-color-on-secondary-container);transition:translate 50ms ease}.cursor.svelte-niexr button.svelte-niexr{position:absolute;top:-24px;left:0;height:24px;padding:0;color:var(--md-sys-color-on-secondary-container);background:var(--md-sys-color-secondary-container);border:2px solid currentcolor;border-radius:12px 12px 12px 0}.edited.svelte-niexr.svelte-niexr{color:var(--md-sys-color-primary)}.edited.svelte-niexr sup.svelte-niexr{opacity:1}[role=textbox].svelte-niexr.svelte-niexr{cursor:text;position:relative;display:flex;align-items:center;height:1em;padding-block:4px}[role=textbox].svelte-niexr.svelte-niexr::after,[role=textbox].svelte-niexr.svelte-niexr::before{content:"";position:absolute;bottom:-4px;width:100%;height:1px;opacity:0;background:currentcolor;transition:opacity 150ms ease, scale 250ms ease}[role=textbox].svelte-niexr.svelte-niexr::after{scale:0 1;transition-duration:250ms}[role=textbox].svelte-niexr.svelte-niexr:hover::before{opacity:0.3}[role=textbox].svelte-niexr.svelte-niexr:focus-within{outline:none}[role=textbox].svelte-niexr.svelte-niexr:focus-within::after{scale:1;opacity:1}',
  map: null
};
const ChordPhraseEdit = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { chord } = $$props;
  let box;
  if ($$props.chord === void 0 && $$bindings.chord && chord !== void 0)
    $$bindings.chord(chord);
  $$result.css.add(css$3);
  return `<div role="textbox" tabindex="0" class="${[
    "svelte-niexr",
    chord.phrase.length !== 0 && chord.phraseChanged ? "edited" : ""
  ].join(" ").trim()}"${add_attribute("this", box, 0)}>${`<div></div> `} ${validate_component(ActionString, "ActionString").$$render($$result, { actions: chord.phrase }, {}, {})} <sup class="svelte-niexr" data-svelte-h="svelte-ouf49e">•</sup> </div>`;
});
const ChordActionEdit_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: 'span.svelte-1dgr3vl.svelte-1dgr3vl{opacity:0.5}sup.svelte-1dgr3vl.svelte-1dgr3vl{translate:0 -60%;opacity:0;transition:opacity 250ms ease}button.svelte-1dgr3vl.svelte-1dgr3vl{position:relative;display:inline-flex;gap:4px;height:32px;margin-inline:4px}button.svelte-1dgr3vl.svelte-1dgr3vl:focus-within{outline:none}button.svelte-1dgr3vl.svelte-1dgr3vl::after{content:"";position:absolute;top:50%;transform-origin:center left;translate:-6px 0;scale:0 1;width:calc(100% - 32px);height:1px;background:currentcolor;transition:scale 250ms ease, color 250ms ease}.edited.svelte-1dgr3vl.svelte-1dgr3vl{color:var(--md-sys-color-primary)}.edited.svelte-1dgr3vl>sup.svelte-1dgr3vl{opacity:1}.deleted.svelte-1dgr3vl.svelte-1dgr3vl{color:var(--md-sys-color-error)}.deleted.svelte-1dgr3vl.svelte-1dgr3vl::after{scale:1}',
  map: null
};
const ChordActionEdit = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let { chord = void 0 } = $$props;
  createEventDispatcher();
  if ($$props.chord === void 0 && $$bindings.chord && chord !== void 0)
    $$bindings.chord(chord);
  $$result.css.add(css$2);
  $$unsubscribe_LL();
  return `<button class="${[
    "svelte-1dgr3vl",
    (chord && chord.phrase.length === 0 ? "deleted" : "") + " " + (chord && chord.actionsChanged ? "edited" : "")
  ].join(" ").trim()}">${`${!chord ? `<span class="svelte-1dgr3vl">${escape($LL.configure.chords.NEW_CHORD())}</span>` : ``}`} ${validate_component(ActionString, "ActionString").$$render(
    $$result,
    {
      display: "keys",
      actions: chord?.actions ?? []
    },
    {},
    {}
  )} <sup class="svelte-1dgr3vl" data-svelte-h="svelte-ouf49e">•</sup> </button>`;
});
const ChordEdit_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".separator.svelte-1dhtuxh{display:inline-flex;width:1px;height:24px;opacity:0.2;background:currentcolor}td.svelte-1dhtuxh{position:relative}.table-buttons.svelte-1dhtuxh{opacity:0;transition:opacity 75ms ease}tr:focus-within>.table-buttons.svelte-1dhtuxh,tr:hover>.table-buttons.svelte-1dhtuxh{opacity:1}",
  map: null
};
const ChordEdit = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { chord } = $$props;
  if ($$props.chord === void 0 && $$bindings.chord && chord !== void 0)
    $$bindings.chord(chord);
  $$result.css.add(css$1);
  return `<th>${validate_component(ChordActionEdit, "ChordActionEdit").$$render($$result, { chord }, {}, {})}</th> <td class="svelte-1dhtuxh">${validate_component(ChordPhraseEdit, "ChordPhraseEdit").$$render($$result, { chord }, {}, {})}</td> <td class="table-buttons svelte-1dhtuxh">${chord.phrase.length !== 0 ? `<button class="icon compact" data-svelte-h="svelte-18t8q">delete</button>` : `${chord.phraseChanged ? `<button class="icon compact" data-svelte-h="svelte-7lvlk3">restore_from_trash</button>` : ``}`} <button class="${["icon compact", chord.isApplied ? "disabled" : ""].join(" ").trim()}" data-svelte-h="svelte-1keg9r3">undo</button> <div class="separator svelte-1dhtuxh"></div> <button class="icon compact" data-svelte-h="svelte-1ooqupu">share</button> </td>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".search-container.svelte-nxhahq{display:flex;align-items:center;justify-content:center}.paginator.svelte-nxhahq{display:flex;justify-content:flex-end;min-width:8ch}caption.svelte-nxhahq{margin-top:156px}input[type=search].svelte-nxhahq{width:512px;margin-block-start:16px;padding-block:8px;padding-inline:16px;font-size:16px;color:inherit;background:none;border:0 solid var(--md-sys-color-surface-variant);border-bottom-width:1px;transition:all 250ms ease}input[type=search].svelte-nxhahq::-moz-placeholder{color:var(--md-sys-color-on-surface-variant);opacity:0.2}input[type=search].svelte-nxhahq::placeholder{color:var(--md-sys-color-on-surface-variant);opacity:0.2}input[type=search].svelte-nxhahq:focus{border-color:var(--md-sys-color-primary);outline:none}section.svelte-nxhahq{position:relative;overflow:hidden;height:100%;padding-inline:8px;border-radius:16px}table.svelte-nxhahq{overflow:hidden;min-width:min(90vw, 16.5cm);transition:all 1s ease}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $items, $$unsubscribe_items;
  let $chords, $$unsubscribe_chords;
  let $LL, $$unsubscribe_LL;
  let $lastPage, $$unsubscribe_lastPage;
  let $pageSize, $$unsubscribe_pageSize;
  $$unsubscribe_chords = subscribe(chords, (value) => $chords = value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let results;
  const pageSize = writable(0);
  $$unsubscribe_pageSize = subscribe(pageSize, (value) => $pageSize = value);
  onDestroy(() => {
  });
  function buildIndex(chords2) {
    const index = new Index({ tokenize: "full" });
    chords2.forEach((chord, i) => {
      if ("phrase" in chord) {
        index.add(i, chord.phrase.map((it) => KEYMAP_CODES[it].id).join(""));
      }
    });
    return index;
  }
  const searchFilter = writable(void 0);
  const items = derived([searchFilter, chords], ([filter, chords2]) => filter?.map((it) => [chords2[it], it]) ?? chords2.map((it, i) => [it, i]));
  $$unsubscribe_items = subscribe(items, (value) => $items = value);
  const lastPage = derived([items, pageSize], ([items2, pageSize2]) => Math.ceil((items2.length + 1) / pageSize2) - 1);
  $$unsubscribe_lastPage = subscribe(lastPage, (value) => $lastPage = value);
  setContext("cursor-crossfade", crossfade({}));
  let page = 0;
  $$result.css.add(css);
  $chords?.length > 0 ? buildIndex($chords) : void 0;
  {
    {
      page = 0;
    }
  }
  $$unsubscribe_items();
  $$unsubscribe_chords();
  $$unsubscribe_LL();
  $$unsubscribe_lastPage();
  $$unsubscribe_pageSize();
  return `${$$result.head += `<!-- HEAD_svelte-1cwk6hs_START -->${$$result.title = `<title>Chord Manager</title>`, ""}<!-- HEAD_svelte-1cwk6hs_END -->`, ""} <div class="search-container svelte-nxhahq"><input type="search"${add_attribute("placeholder", $LL.configure.chords.search.PLACEHOLDER($chords.length), 0)} class="svelte-nxhahq"> <div class="paginator svelte-nxhahq">${$lastPage !== -1 ? `${escape(page + 1)} / ${escape($lastPage + 1)}` : `- / -`}</div> <button class="icon" data-svelte-h="svelte-18qb9j7">navigate_before</button> <button class="icon" data-svelte-h="svelte-wgltnv">navigate_next</button></div> <section class="svelte-nxhahq"${add_attribute("this", results, 0)}><table class="svelte-nxhahq">${page === 0 ? `<tr><th>${validate_component(ChordActionEdit, "ChordActionEdit").$$render($$result, {}, {}, {})}</th><td></td><td></td></tr>` : ``} ${$lastPage !== -1 ? `${each($items.slice(page * $pageSize - (page === 0 ? 0 : 1), (page + 1) * $pageSize - 1), ([chord]) => {
    return `<tr>${validate_component(ChordEdit, "ChordEdit").$$render($$result, { chord }, {}, {})} </tr>`;
  })}` : `<caption class="svelte-nxhahq" data-svelte-h="svelte-b5pbjt">No Results</caption>`}</table> </section>`;
});
export {
  Page as default
};
