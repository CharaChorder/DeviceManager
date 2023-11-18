import { c as create_ssr_component, a as subscribe, d as escape, b as add_attribute } from "../../../chunks/ssr.js";
import "../../../chunks/keymap-codes.js";
import { EditorView } from "codemirror";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { L as LL } from "../../../chunks/i18n-svelte.js";
import { a as serialPort } from "../../../chunks/connection.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "section.svelte-aqc7uo{display:flex;flex-direction:column;gap:8px;width:100%}iframe.svelte-aqc7uo{display:none}button.svelte-aqc7uo{cursor:pointer;display:flex;align-items:center;justify-content:center;width:-moz-min-content;width:min-content;padding-inline-start:0;padding-inline-end:8px;font-size:14px;font-weight:bold;color:var(--md-sys-color-on-primary);background:var(--md-sys-color-primary);border:none;border-radius:4px}.editor-root.svelte-aqc7uo{width:100%;height:100%}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $serialPort, $$unsubscribe_serialPort;
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_serialPort = subscribe(serialPort, (value) => $serialPort = value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  EditorView.baseTheme({
    ".cm-editor .cm-content": {
      fontFamily: '"Noto Sans Mono", monospace'
    },
    ".cm-FoldPlaceholder": {
      backgroundColor: "var(--md-sys-color-surface-variant)",
      color: "var(--md-sys-color-on-surface-variant)"
    },
    ".cm-gutters": {
      backgroundColor: "var(--md-sys-color-surface-variant)",
      color: "var(--md-sys-color-on-surface-variant)",
      borderColor: "var(--md-sys-color-outline)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--md-sys-color-tertiary)",
      color: "var(--md-sys-color-on-tertiary)"
    },
    ".cm-activeLine": { backgroundColor: "transparent" },
    ".cm-cursor": {
      borderColor: "var(--md-sys-color-on-background)"
    },
    ".cm-selectionBackground": {
      background: "transparent !important",
      backdropFilter: "invert(0.3)"
    }
  });
  HighlightStyle.define(
    [
      {
        tag: tags.keyword,
        color: "var(--md-sys-color-primary)"
      },
      {
        tag: tags.number,
        color: "var(--md-sys-color-secondary)"
      },
      {
        tag: tags.string,
        color: "var(--md-sys-color-tertiary)"
      },
      {
        tag: tags.comment,
        color: "var(--md-sys-color-on-background)",
        opacity: 0.6
      }
    ],
    {
      all: {
        fontFamily: '"Noto Sans Mono", monospace',
        fontSize: "14px"
      }
    }
  );
  javascriptLanguage.data.of({
    autocomplete: function completeGlobals(context) {
      if (context.matchBefore(/Chara\./))
        ;
    }
  });
  const charaMethods = [
    "reboot",
    "bootloader",
    "getRamBytesAvailable",
    "getSetting",
    "setSetting",
    "getLayoutKey",
    "setLayoutKey",
    "deleteChord",
    "setChord",
    "getChordPhrase",
    "getChordCount",
    "getChord",
    "send"
  ];
  let frame;
  let editor;
  $$result.css.add(css);
  $serialPort ? {
    getVersion: async (..._args) => $serialPort.version,
    getDevice: async (..._args) => $serialPort.device,
    commit: async (..._args) => {
      if (confirm("Perform a commit? Settings are already applied until the next reboot.\n\nExcessive commits can lead to premature breakdowns, as the settings storage is only rated for 10,000-25,000 commits.\n\nClick OK to perform the commit anyways.")) {
        return $serialPort.commit();
      }
    },
    ...Object.fromEntries(charaMethods.map((it) => [it, $serialPort[it].bind($serialPort)]))
  } : {};
  $$unsubscribe_serialPort();
  $$unsubscribe_LL();
  return ` <section class="svelte-aqc7uo"><button class="svelte-aqc7uo"><span class="icon" data-svelte-h="svelte-ficmqa">play_arrow</span>${escape($LL.plugin.editor.RUN())}</button> <div class="editor-root svelte-aqc7uo"${add_attribute("this", editor, 0)}></div></section> <iframe aria-hidden="true" title="code sandbox" src="/sandbox.html" sandbox="allow-scripts" class="svelte-aqc7uo"${add_attribute("this", frame, 0)}></iframe>`;
});
export {
  Page as default
};
