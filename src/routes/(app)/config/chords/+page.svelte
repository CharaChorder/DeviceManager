<script lang="ts">
  import { EditorView } from "codemirror";
  import "$lib/chord-editor/chords.grammar";
  import { persistentWritable } from "$lib/storage";
  import ActionList from "$lib/components/layout/ActionList.svelte";
  import {
    createConfig,
    loadPersistentState,
  } from "$lib/chord-editor/persistent-state-plugin";
  import { parsedChordsField } from "$lib/chord-editor/parsed-chords-plugin";
  import type { CharaChordFile } from "$lib/share/chara-file";
  import { EditorState } from "@codemirror/state";
  import { deviceChords } from "$lib/serial/connection";
  import { editorSyncChords } from "$lib/chord-editor/chord-sync-plugin";

  let queryFilter: string | undefined = $state(undefined);

  const rawCode = persistentWritable("chord-editor-raw-code", false);
  const showEdits = persistentWritable("chord-editor-show-edits", true);
  const denseSpacing = persistentWritable("chord-editor-spacing", false);

  let editor: HTMLDivElement | undefined = $state(undefined);
  let view: EditorView | undefined = $state(undefined);

  $effect(() => {
    if (!editor) return;
    const viewPromise = loadPersistentState({
      rawCode: $rawCode,
      storeName: "chord-editor-state-storage",
      autocomplete(query) {
        queryFilter = query;
      },
    }).then(
      (state) =>
        new EditorView({
          parent: editor,
          state,
        }),
    );
    viewPromise.then((it) => (view = it));
    return () => viewPromise.then((it) => it.destroy());
  });

  $effect(() => {
    console.log("Syncing chords to editor");
    if (view) {
      editorSyncChords(
        view,
        $deviceChords.map((chord) => [chord.actions, chord.phrase] as const),
      );
    }
  });

  function regenerate() {
    if (!view) return;
    view.setState(
      EditorState.create(
        createConfig({
          rawCode: $rawCode,
          storeName: "chord-editor-state-storage",
          autocomplete(query) {
            queryFilter = query;
          },
        }),
      ),
    );
    editorSyncChords(
      view,
      $deviceChords.map((chord) => [chord.actions, chord.phrase] as const),
    );
  }

  function downloadBackup() {
    if (!view) return;
    const backup: CharaChordFile = {
      charaVersion: 1,
      type: "chords",
      chords: view.state
        .field(parsedChordsField)
        .chords.map((chord) => [
          chord.input?.value ?? [],
          chord.phrase?.value ?? [],
        ]),
    };
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

<div class="vertical">
  <div style:display="flex">
    <label><input type="checkbox" bind:checked={$rawCode} />Edit as code</label>
    <!--<label><input type="checkbox" bind:checked={$showEdits} />Show edits</label>-->
    <label
      ><input type="checkbox" bind:checked={$denseSpacing} />Dense Spacing</label
    >
    <button onclick={regenerate}>Reset</button>
    <!--<button onclick={largeFile}>Create Huge File</button>-->
    <button onclick={downloadBackup}>Download Backup</button>
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
</div>

<style lang="scss">
  .vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .split {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    width: calc(min(100%, 1400px));
    min-height: 0;

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
      vertical-align: middle;
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
      text-wrap-style: stable;
      white-space: pre-wrap;
      word-break: break-word;

      > :global(*) {
        break-before: avoid;
        break-after: avoid;
        break-inside: avoid;
      }
    }

    :global(.cm-panels) {
      border-top: none;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
    }

    :global(.chord-ignored) {
      opacity: 0.5;
      background-image: none;
      text-decoration: line-through;
    }

    :global(.chord-child) {
      background-image: none;
      text-decoration: underline;
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
