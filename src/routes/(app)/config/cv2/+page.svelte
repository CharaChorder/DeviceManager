<script lang="ts">
  import { chords } from "$lib/undo-redo";
  import { EditorView } from "codemirror";
  import { actionToValue } from "$lib/chord-editor/action-serializer";
  import "$lib/chord-editor/chords.grammar";
  import { persistentWritable } from "$lib/storage";
  import ActionList from "$lib/components/layout/ActionList.svelte";
  import { splitCompound } from "$lib/serial/chord";
  import { loadPersistentState } from "$lib/chord-editor/persistent-state-plugin";
  import { parsedChordsField } from "$lib/chord-editor/parsed-chords-plugin";
  import type { CharaChordFile } from "$lib/share/chara-file";

  let queryFilter: string | undefined = $state(undefined);

  const rawCode = persistentWritable("chord-editor-raw-code", false);
  const showEdits = persistentWritable("chord-editor-show-edits", true);
  const denseSpacing = persistentWritable("chord-editor-spacing", false);

  let editor: HTMLDivElement | undefined = $state(undefined);
  let view: EditorView;

  $effect(() => {
    if (!editor) return;
    view = new EditorView({
      parent: editor,
      state: loadPersistentState({
        rawCode: $rawCode,
        storeName: "chord-editor-state-storage",
        autocomplete(query) {
          queryFilter = query;
        },
      }),
    });
    return () => view.destroy();
  });

  function regenerate() {
    const doc = $chords
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
      .join("\n");
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: doc },
    });
  }

  function loadBackup(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup: CharaChordFile = JSON.parse(content);
        const doc = backup.chords
          .map((chord) => {
            const [actions, compound] = splitCompound(chord[0]);
            return (
              (compound
                ? "<0x" + compound.toString(16).padStart(8, "0") + ">"
                : "") +
              actions.map((it) => actionToValue(it)).join("") +
              "=>" +
              chord[1].map((it) => actionToValue(it)).join("")
            );
          })
          .join("\n");
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: doc },
        });
      } catch (err) {
        alert("Failed to load backup: " + err);
      }
    };
    reader.readAsText(file);
  }

  function downloadBackup() {
    const backup: CharaChordFile = {
      charaVersion: 1,
      type: "chords",
      chords: view.state.field(parsedChordsField).result,
    };
    console.log(JSON.stringify(backup));
    const blob = new Blob([JSON.stringify(backup)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chord-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div style:display="flex">
  <label><input type="checkbox" bind:checked={$rawCode} />Edit as code</label>
  <!--<label><input type="checkbox" bind:checked={$showEdits} />Show edits</label>-->
  <label
    ><input type="checkbox" bind:checked={$denseSpacing} />Dense Spacing</label
  >
  <button onclick={regenerate}>Regenerate from current chords</button>
  <button onclick={downloadBackup}>Download Backup</button>
  <input
    type="file"
    accept="application/json"
    onchange={loadBackup}
    style="margin-left: 1rem"
  />
</div>

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
    width: calc(min(100%, 1400px));
    height: 100%;

    > :global(*) {
      flex: 1;
    }
  }

  .editor :global(.cm-deletedChunk) {
    opacity: 0.2;
  }

  .editor {
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
