<script lang="ts">
  import { KEYMAP_CODES } from "$lib/serial/keymap-codes";
  import { onMount } from "svelte";
  import { basicSetup, EditorView } from "codemirror";
  import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
  import { defaultKeymap } from "@codemirror/commands";
  import { keymap } from "@codemirror/view";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { tags } from "@lezer/highlight";
  import LL from "$i18n/i18n-svelte";
  import type { CompletionContext, Completion } from "@codemirror/autocomplete";
  import { syntaxTree } from "@codemirror/language";
  import { serialPort } from "$lib/serial/connection";
  import examplePlugin from "./example-plugin.js?raw";
  import {
    charaMethods,
    type ChannelCharaEventData,
    type ChannelResponseEventData,
  } from "./plugin-types";

  let theme = EditorView.baseTheme({
    ".cm-editor .cm-content": {
      fontFamily: '"Noto Sans Mono", monospace',
    },
    ".cm-FoldPlaceholder": {
      backgroundColor: "var(--md-sys-color-surface-variant)",
      color: "var(--md-sys-color-on-surface-variant)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--md-sys-color-surface-variant)",
      color: "var(--md-sys-color-on-surface-variant)",
      borderColor: "var(--md-sys-color-outline)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--md-sys-color-tertiary)",
      color: "var(--md-sys-color-on-tertiary)",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-cursor": {
      borderColor: "var(--md-sys-color-on-background)",
    },
    ".cm-selectionBackground": {
      background: "transparent !important",
      backdropFilter: "invert(0.3)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--md-sys-color-background) !important",
      color: "var(--md-sys-color-on-background)",
      borderColor: "var(--md-sys-color-outline)",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "var(--md-sys-color-primary) !important",
      color: "var(--md-sys-color-on-primary) !important",
    },
    ".cm-completionIcon.cm-completionIcon-keyword::after": {
      content: "'🗝'",
    },
  });
  const highlightStyle = HighlightStyle.define(
    [
      { tag: tags.keyword, color: "var(--md-sys-color-primary)" },
      { tag: tags.number, color: "var(--md-sys-color-secondary)" },
      { tag: tags.string, color: "var(--md-sys-color-tertiary)" },
      {
        tag: tags.comment,
        color: "var(--md-sys-color-on-background)",
        opacity: 0.6,
      },
    ],
    {
      all: { fontFamily: '"Noto Sans Mono", monospace', fontSize: "14px" },
    },
  );

  const globalsCompletion: Completion[] = [
    { label: "Chara", type: "class", boost: 90 },
    { label: "Actions", type: "class", boost: 90 },
  ];

  const actionsCompletion: Completion[] = Array.from(
    KEYMAP_CODES,
    ([id, info]) => {
      const isValidIdentifier =
        info.id && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(info.id);
      return {
        label: info.id
          ? isValidIdentifier
            ? info.id
            : `["${info.id}"]`
          : info.id!,
        displayLabel: info.id,
        detail: [info.title, `(0x${id.toString(16)})`, info.description]
          .filter((it) => !!it)
          .join(" "),
        section: info.category,
        boost: isValidIdentifier ? Math.min(info.id?.length ?? 0, 10) + 50 : 40,
        type: "property",
      };
    },
  ).filter((it) => it.label !== undefined);

  const completion = javascriptLanguage.data.of({
    autocomplete: function completeGlobals(context: CompletionContext) {
      let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
      if (nodeBefore.name === "VariableName") {
        return {
          from: nodeBefore.from,
          options: globalsCompletion,
        };
      } else if (nodeBefore.name === "Script") {
        return {
          from: context.pos,
          options: globalsCompletion,
        };
      } else if (
        (nodeBefore.name === "PropertyName" || nodeBefore.name === ".") &&
        nodeBefore.parent?.name === "MemberExpression" &&
        nodeBefore.parent.firstChild
      ) {
        const variable = nodeBefore.parent.firstChild;
        const variableName = context.state.sliceDoc(variable.from, variable.to);
        if (variableName === "Actions") {
          return {
            from:
              nodeBefore.name === "PropertyName"
                ? nodeBefore.from
                : nodeBefore.to,
            options: actionsCompletion,
          };
        }
        let parent = nodeBefore.prevSibling;
        while (parent !== null && parent?.name !== "VariableName") {
          parent = parent.prevSibling;
        }
        if (parent) {
        }
      }
      return null;
    },
  });

  onMount(() => {
    editorView = new EditorView({
      extensions: [
        basicSetup,
        javascript(),
        keymap.of(defaultKeymap),
        theme,
        syntaxHighlighting(highlightStyle),
        completion,
      ],
      parent: editor,
      doc: examplePlugin,
    });
  });
  let channels = $derived(
    $serialPort
      ? ({
          getVersion: async (..._args: unknown[]) => $serialPort.version,
          getDevice: async (..._args: unknown[]) => $serialPort.device,
          commit: async (..._args: unknown[]) => {
            if (
              confirm(
                "Perform a commit? Settings are already applied until the next reboot.\n\n" +
                  "Excessive commits can lead to premature breakdowns, as the settings storage is only rated for 10,000-25,000 commits.\n\n" +
                  "Click OK to perform the commit anyways.",
              )
            ) {
              return $serialPort.commit();
            }
          },
          ...Object.fromEntries(
            charaMethods.map(
              (it) => [it, $serialPort[it].bind($serialPort)] as const,
            ),
          ),
        } satisfies Record<string, Function>)
      : ({} as any),
  );

  async function onMessage(event: MessageEvent) {
    if (event.origin !== "null" || event.source !== frame.contentWindow) return;

    const [channel, params] = event.data;
    const response = channels[channel as keyof typeof channels](...params);
    frame.contentWindow!.postMessage(
      { response: await response } satisfies ChannelResponseEventData,
      "*",
    );
  }

  function runPlugin() {
    frame.contentWindow?.postMessage(
      {
        actionCodes: KEYMAP_CODES,
        script: editorView.state.doc.toString(),
        charaChannels: Object.keys(channels),
      } satisfies ChannelCharaEventData,
      "*",
    );
  }

  let frame: HTMLIFrameElement;
  let editor: HTMLDivElement;
  let editorView: EditorView;
</script>

<svelte:window onmessage={onMessage} />
<section>
  <button onclick={runPlugin}
    ><span class="icon">play_arrow</span>{$LL.plugin.editor.RUN()}</button
  >
  <div class="editor-root" bind:this={editor}></div>
</section>

<iframe
  aria-hidden="true"
  title="code sandbox"
  bind:this={frame}
  src="/sandbox/"
  sandbox="allow-scripts"
></iframe>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  iframe {
    display: none;
  }

  button {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min-content;
    padding-inline-start: 0;
    padding-inline-end: 8px;

    font-size: 14px;
    font-weight: bold;
    color: var(--md-sys-color-on-primary);

    background: var(--md-sys-color-primary);
    border: none;
    border-radius: 4px;
  }

  .editor-root {
    width: 100%;
    height: 100%;
  }
</style>
