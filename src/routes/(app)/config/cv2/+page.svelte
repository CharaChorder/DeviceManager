<script lang="ts">
  import { chords } from "$lib/undo-redo";
  import { EditorView } from "codemirror";
  import { actionToValue } from "$lib/chord-editor/action-serializer";
  import { actionPlugin } from "$lib/chord-editor/action-plugin";
  import { delimPlugin } from "$lib/chord-editor/chord-delim-plugin";
  import {
    drawSelection,
    dropCursor,
    highlightActiveLine,
    highlightSpecialChars,
    keymap,
  } from "@codemirror/view";
  import { history, standardKeymap } from "@codemirror/commands";
  import "$lib/chord-editor/chords.grammar";
  import {
    chordHighlightStyle,
    chordLanguageSupport,
  } from "$lib/chord-editor/chords-grammar-plugin";
  import { syntaxHighlighting } from "@codemirror/language";
  import { autocompletion } from "@codemirror/autocomplete";
  import { persistentWritable } from "$lib/storage";
  import ActionList from "$lib/components/layout/ActionList.svelte";

  const rawCode = persistentWritable("chord-editor-raw-code", false);
  const showEdits = persistentWritable("chord-editor-show-edits", true);
  let originalDoc = $derived(
    $chords
      .map((chord) => {
        return (
          chord.actions
            .filter((it) => it !== 0)
            .map((it) => actionToValue(it))
            .join("") +
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
        autocompletion({ icons: false, selectOnOpen: true }),
        history(),
        dropCursor(),
        syntaxHighlighting(chordHighlightStyle),
        highlightActiveLine(),
        drawSelection(),
        highlightSpecialChars(),
        keymap.of(standardKeymap),
      ],
    });
    return () => view.destroy();
  });
</script>

<label><input type="checkbox" bind:checked={$rawCode} />View as code</label>
<label><input type="checkbox" bind:checked={$showEdits} />Show edits</label>

<div class="split">
  <div
    class="editor"
    class:hide-edits={!$showEdits}
    class:raw={$rawCode}
    bind:this={editor}
  ></div>
  <ActionList />
</div>

<style lang="scss">
  .split {
    display: flex;
    gap: 1rem;
    height: 100%;

    > :global(:last-child) {
      max-width: 600px;
    }
  }

  .editor:not(.raw) :global(.cm-line) {
    margin-inline: auto;
    width: fit-content;
  }

  .editor :global(.cm-deletedChunk) {
    opacity: 0.2;
  }

  .editor {
    min-width: 600px;
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
      border: none;
      background-color: transparent;
    }

    :global(.cm-editor) {
      outline: none;
      height: 100%;
    }

    :global(.cm-line) {
      border-bottom: 1px solid transparent;
      line-height: 3em;
    }

    :global(.cm-scroller) {
      overflow: auto;
      font-family: inherit !important;
    }

    :global(.cm-cursor) {
      border-color: var(--md-sys-color-on-surface);
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
      /*background-color: color-mix(
        in srgb,
        var(--md-sys-color-surface-variant) 40%,
        transparent
      ) !important;*/

      &:not(.cm-changedLine) {
        background-color: transparent !important;
      }
    }

    :global(.cm-selectionBackground) {
      background-color: var(--md-sys-color-surface-variant) !important;
    }
  }
</style>
