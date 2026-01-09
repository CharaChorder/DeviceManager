<script lang="ts">
  import { chords } from "$lib/undo-redo";
  import { EditorView } from "codemirror";
  import { actionToValue } from "$lib/chord-editor/action-serializer";
  import { actionPlugin } from "$lib/chord-editor/action-plugin";
  import { delimPlugin } from "$lib/chord-editor/chord-delim-plugin";
  import { highlightActiveLine, keymap } from "@codemirror/view";
  import { history, standardKeymap } from "@codemirror/commands";
  import "$lib/chord-editor/chords.grammar";
  import {
    chordHighlightStyle,
    chordLanguageSupport,
  } from "$lib/chord-editor/chords-grammar-plugin";
  import { syntaxHighlighting } from "@codemirror/language";
  import { persistentWritable } from "$lib/storage";
  import ActionList from "$lib/components/layout/ActionList.svelte";
  import { actionAutocompletePlugin } from "$lib/chord-editor/autocomplete";
  import {
    actionLinter,
    actionLinterDependencies,
  } from "$lib/chord-editor/action-linter";
  import { forceLinting } from "@codemirror/lint";
  import { untrack } from "svelte";
  import { splitCompound } from "$lib/serial/chord";

  let queryFilter: string | undefined = $state(undefined);

  const rawCode = persistentWritable("chord-editor-raw-code", false);
  const showEdits = persistentWritable("chord-editor-show-edits", true);
  const denseSpacing = persistentWritable("chord-editor-spacing", false);

  let originalDoc = $derived(
    $chords
      .map((chord) => {
        const [actions, compound] = splitCompound(chord.actions);
        return (
          (compound
            ? "<0x" + compound.toString(16).padStart(8, "0") + ">"
            : "") +
          actions.map((it) => actionToValue(it)).join("") +
          "=>" +
          chord.phrase.map((it) => actionToValue(it)).join("")
        );
      })
      .join("\n"),
  );
  let editor: HTMLDivElement | undefined = $state(undefined);
  let view: EditorView;

  $effect(() => {
    if (!editor) return;
    view = new EditorView({
      parent: editor,
      doc: originalDoc,
      extensions: [
        ...($rawCode ? [] : [delimPlugin, actionPlugin]),
        chordLanguageSupport(),
        actionLinter,
        // lineNumbers(),
        actionAutocompletePlugin((query) => {
          queryFilter = query;
        }),
        history(),
        syntaxHighlighting(chordHighlightStyle),
        highlightActiveLine(),
        // drawSelection(),
        EditorView.theme({
          ".cm-line": {
            borderBottom: "1px solid transparent",
            caretColor: "var(--md-sys-color-on-surface)",
          },
          ".cm-scroller": {
            overflow: "auto",
            width: "100%",
            fontFamily: "inherit !important",
            gap: "8px",
          },
          ".cm-content": {
            width: "100%",
          },
          ".cm-cursor": {
            borderColor: "var(--md-sys-color-on-surface)",
          },
        }),
        keymap.of(standardKeymap),
      ],
    });
    return () => view.destroy();
  });

  $effect(() => {
    $actionLinterDependencies;
    untrack(() => view && forceLinting(view));
  });
</script>

<label><input type="checkbox" bind:checked={$rawCode} />Edit as code</label>
<!--<label><input type="checkbox" bind:checked={$showEdits} />Show edits</label>-->
<label
  ><input type="checkbox" bind:checked={$denseSpacing} />Dense Spacing</label
>

<div class="split">
  <div
    class="editor"
    class:hide-edits={!$showEdits}
    class:raw={$rawCode}
    class:dense-spacing={$denseSpacing}
    bind:this={editor}
  ></div>
  <ActionList {queryFilter} ignoreIcon={$rawCode} />
</div>

<style lang="scss">
  .split {
    display: flex;
    gap: 1rem;
    height: 100%;

    > :global(:last-child) {
      width: min(600px, 30vw);
    }
  }

  .editor :global(.cm-deletedChunk) {
    opacity: 0.2;
  }

  .editor {
    width: min(600px, 30vw);
    height: 100%;
    font-size: 16px;

    :global(.cm-tooltip) {
      border: none;
      border-radius: 4px;
      background-color: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);

      :global(ul) {
        font-family: inherit !important;
      }

      :global(li[role="option"][aria-selected="true"]) {
        border-radius: 4px;
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }

      :global(completion-section) {
        margin-block: 8px;
        border-bottom: none !important;
      }
    }

    &:not(.raw) :global(.cm-line) {
      columns: 2;
      text-align: center;
    }

    &.dense-spacing :global(.cm-line) {
      padding-block: 0;
    }

    :global(.cm-line) {
      padding-block: 8px;
      width: 100%;
      text-wrap: wrap;
      white-space: pre-wrap;
      word-break: break-word;

      > :global(*) {
        break-before: avoid;
        break-after: avoid;
        break-inside: avoid;
      }
    }

    :global(.chord-ignored) {
      opacity: 0.5;
      background-image: none;
      text-decoration: line-through;
    }

    :global(.chord-invalid) {
      color: var(--md-sys-color-error);
      text-decoration-color: var(--md-sys-color-error);
    }

    :global(.change-button) {
      height: 24px;
      font-size: 16px;
    }

    :global(.cm-deletedLineGutter) {
      background-color: var(--md-sys-color-error);
    }

    :global(.cm-changedLineGutter) {
      background-color: var(--md-sys-color-success);
    }

    :global(.cm-changedText) {
      background: linear-gradient(
          var(--md-sys-color-primary),
          var(--md-sys-color-primary)
        )
        bottom / 100% 1px no-repeat;
    }

    :global(.cm-gutters) {
      border-color: transparent;
      background-color: transparent;
    }

    &.raw :global(.cm-gutters) {
      border-color: var(--md-sys-color-surface-variant);
      background-color: var(--md-sys-color-surface);
    }

    :global(.cm-editor) {
      outline: none;
      height: 100%;
    }

    :global(.cm-changedLine) {
      background-color: color-mix(
        in srgb,
        var(--md-sys-color-primary) 5%,
        transparent
      ) !important;
    }

    :global(.cm-activeLine),
    :global(.cm-line:hover) {
      --auto-space-show: 1;
    }

    :global(.cm-activeLine) {
      border-bottom: 1px solid var(--md-sys-color-surface-variant);

      &:not(.cm-changedLine) {
        background-color: transparent !important;
      }
    }

    :global(::selection),
    :global(.cm-selectionBackground) {
      background-color: var(--md-sys-color-surface-variant) !important;
    }
  }
</style>
