<script lang="ts">
  import {
    serialPort,
    sync,
    syncProgress,
    syncStatus,
  } from "$lib/serial/connection";
  import type { ParseResult } from "./parse-meta";
  import { actionTooltip } from "$lib/title";
  import LL from "$i18n/i18n-svelte";
  import ProgressButton from "$lib/ProgressButton.svelte";
  import type { EditorView } from "codemirror";
  import { createSaveTask } from "./save-chords";
  import { goto } from "$app/navigation";

  let { parsed, view }: { parsed: ParseResult; view: EditorView } = $props();

  $inspect(parsed);

  let added = $derived(
    parsed.chords.reduce(
      (acc, chord) =>
        acc +
        (chord.phrase && chord.phrase.originalValue === undefined ? 1 : 0),
      0,
    ),
  );

  let changed = $derived(
    parsed.chords.reduce(
      (acc, chord) =>
        acc +
        (chord.phrase?.originalValue !== undefined &&
        chord.phrase.originalValue !== chord.phrase.value
          ? 1
          : 0),
      0,
    ),
  );

  let error: Error | undefined = $state(undefined);

  async function save() {
    const port = $serialPort;
    if (!view || !port) return;
    error = undefined;
    const task = createSaveTask(view);
    const total = task.remove.length + task.set.length;
    $syncStatus = "uploading";
    $syncProgress = { current: 0, max: total };
    let progressCount = 0;
    for (const input of task.remove) {
      try {
        await port.deleteChord({ actions: input });
      } catch (e) {
        error = e as Error;
      }
      progressCount++;
      $syncProgress = { current: progressCount, max: total };
    }
    for (const [input, phrase] of task.set) {
      try {
        await port.setChord({ actions: input, phrase });
      } catch (e) {
        error = e as Error;
      }
      progressCount++;
      $syncProgress = { current: progressCount, max: total };
    }
    if (error !== undefined) {
      goto("/terminal");
    }
    await sync();
  }

  let removed = $derived(parsed.removed.length);
</script>

<div class="container">
  {#if added + changed + removed !== 0 || $syncStatus === "uploading" || $syncStatus === "error"}
    <div {@attach actionTooltip($LL.saveActions.SAVE())}>
      <ProgressButton
        disabled={$syncStatus !== "done"}
        working={$syncStatus === "uploading" || $syncStatus === "downloading"}
        progress={$syncProgress && $syncStatus === "uploading"
          ? $syncProgress.current / $syncProgress.max
          : 0}
        style="--height: 36px"
        error={error !== undefined
          ? (error.message ?? error.toString())
          : undefined}
        onclick={save}
      >
        <span class="icon">save</span>
        {$LL.saveActions.SAVE()}
      </ProgressButton>
    </div>
  {/if}

  <div>
    {#if added}
      <span class="added">+{added}</span>
    {/if}
    {#if changed}
      <span class="changed">~{changed}</span>
    {/if}
    {#if removed}
      <span class="removed">-{removed}</span>
    {/if}
  </div>

  {#if parsed.aliases.size > 0}
    <div class="section">
      <span class="icon">content_copy</span>
      <span>{parsed.aliases.size}</span>
    </div>
  {/if}
</div>

<style lang="scss">
  .icon {
    font-size: 16px;
  }

  .container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
  }

  .section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .added {
    color: var(--md-sys-color-success);
  }

  .changed {
    color: var(--md-sys-color-warning);
  }

  .removed {
    color: var(--md-sys-color-error);
  }
</style>
