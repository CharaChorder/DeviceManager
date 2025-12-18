<script lang="ts">
  import LL from "$i18n/i18n-svelte";
  import {
    changes,
    ChangeType,
    layout,
    overlay,
    settings,
    duplicateChords,
  } from "$lib/undo-redo";
  import type { Change, ChordChange } from "$lib/undo-redo";
  import { fly } from "svelte/transition";
  import { actionTooltip } from "$lib/title";
  import {
    deviceChords,
    deviceLayout,
    deviceSettings,
    serialLog,
    serialPort,
    sync,
    syncProgress,
    syncStatus,
  } from "$lib/serial/connection";
  import ProgressButton from "$lib/ProgressButton.svelte";
  import { tick } from "svelte";
  import { goto } from "$app/navigation";

  function undo(event: MouseEvent) {
    if (event.shiftKey) {
      changes.set([]);
    } else {
      redoQueue.unshift($changes.pop()!);
      changes.update((it) => it);
    }
  }

  function redo() {
    const change = redoQueue.shift();
    if (change) {
      changes.update((it) => {
        it.push(change);
        return it;
      });
    }
  }
  let redoQueue: Change[][] = $state([]);
  let error = $state<Error | undefined>(undefined);
  let progressButton: HTMLButtonElement | undefined = $state();

  async function saveLayoutChanges(progress: () => void): Promise<boolean> {
    const port = $serialPort;
    if (!port) return false;
    try {
      for (const [profile, layout] of $overlay.layout.entries()) {
        if (layout === undefined) continue;
        for (const [layer, actions] of layout.entries()) {
          if (actions === undefined) continue;
          for (const [id, action] of actions) {
            if (action === undefined) continue;
            await port.setLayoutKey(profile, layer + 1, id, action);
            progress();
          }
        }
      }
      $deviceLayout = $layout.map((profile) =>
        profile.map((layer) => layer.map<number>(({ action }) => action)),
      );
      changes.update((changes) =>
        changes
          .map((it) => it.filter((it) => it.type !== ChangeType.Layout))
          .filter((it) => it.length > 0),
      );
    } catch (e) {
      console.error(e);
      return false;
    }
    await tick();
    return true;
  }

  async function saveSettings(progress: () => void): Promise<boolean> {
    const port = $serialPort;
    if (!port) return false;
    try {
      for (const [profile, settings] of $overlay.settings.entries()) {
        if (settings === undefined) continue;
        for (const [id, setting] of settings.entries()) {
          if (setting === undefined) continue;
          await port.setSetting(profile, id, setting);
          progress();
        }
      }
      $deviceSettings = $settings.map((profile) =>
        profile.map(({ value }) => value),
      );
      changes.update((changes) =>
        changes
          .map((it) => it.filter((it) => it.type !== ChangeType.Setting))
          .filter((it) => it.length > 0),
      );
    } catch (e) {
      console.error(e);
      return false;
    }
    await tick();
    return true;
  }

  async function safeDeleteChord(actions: number[]): Promise<boolean> {
    const port = $serialPort;
    if (!port) return false;
    try {
      await port.deleteChord({ actions });
      return true;
    } catch (e) {
      console.error(e);
      try {
        if ((await port.getChordPhrase(actions)) === undefined) {
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }

  async function saveChords(progress: () => void): Promise<boolean> {
    const port = $serialPort;
    if (!port) return false;
    let ok = true;

    const empty = new Set<string>();
    for (const [id, chord] of $overlay.chords) {
      if (chord.actions.length === 0 || chord.phrase.length === 0) {
        empty.add(id);
      }
    }
    changes.update((changes) => {
      changes.push([
        ...empty.keys().map(
          (id) =>
            ({
              type: ChangeType.Chord,
              id: JSON.parse(id),
              deleted: true,
              actions: [],
              phrase: [],
            }) satisfies ChordChange,
        ),
      ]);
      return changes;
    });
    await tick();

    const deleted = new Set<string>();
    const changed = new Map<string, number[]>();
    for (const [id, chord] of $overlay.chords) {
      if (!chord.deleted) continue;
      if (await safeDeleteChord(JSON.parse(id))) {
        deleted.add(id);
      } else {
        ok = false;
      }
      progress();
    }
    deviceChords.update((chords) =>
      chords.filter((chord) => !deleted.has(JSON.stringify(chord.actions))),
    );
    deleted.clear();
    await tick();

    for (const [id, chord] of $overlay.chords) {
      if (chord.deleted) continue;
      if ($duplicateChords.has(JSON.stringify(chord.actions))) {
        ok = false;
      } else {
        let skip = false;
        if (id !== JSON.stringify(chord.actions)) {
          if (await safeDeleteChord(JSON.parse(id))) {
            deleted.add(id);
          } else {
            skip = true;
            ok = false;
          }
        }
        if (!skip) {
          try {
            await port.setChord({
              actions: chord.actions,
              phrase: chord.phrase,
            });
            deleted.add(JSON.stringify(chord.actions));
            changed.set(JSON.stringify(chord.actions), chord.phrase);
          } catch (e) {
            console.error(e);
            ok = false;
          }
        } else {
          ok = false;
        }
      }
      progress();
    }
    deviceChords.update((chords) => {
      chords.filter((chord) => !deleted.has(JSON.stringify(chord.actions)));
      for (const [id, phrase] of changed) {
        chords.push({ actions: JSON.parse(id), phrase });
      }
      return chords;
    });
    await tick();
    return ok;
  }

  async function save() {
    let needsSync = false;
    try {
      const port = $serialPort;
      if (!port) {
        document
          .getElementById("connect-popup")
          ?.showPopover({ source: progressButton });
        return;
      }
      $syncStatus = "uploading";

      const layoutChanges = $overlay.layout.reduce(
        (acc, profile) =>
          acc +
          (profile?.reduce((acc, layer) => acc + (layer?.size ?? 0), 0) ?? 0),
        0,
      );
      const settingChanges = $overlay.settings.reduce(
        (acc, profile) => acc + (profile?.size ?? 0),
        0,
      );
      const chordChanges = $overlay.chords.size;
      needsSync = chordChanges > 0;
      const needsCommit = settingChanges > 0 || layoutChanges > 0;
      const progressMax = layoutChanges + settingChanges + chordChanges;

      let progressCurrent = 0;

      function updateProgress() {
        syncProgress.set({
          max: progressMax,
          current: Math.min(progressMax, progressCurrent++),
        });
      }
      updateProgress();

      let layoutSuccess = await saveLayoutChanges(updateProgress);
      let settingsSuccess = await saveSettings(updateProgress);

      if (needsCommit) {
        try {
          await port.commit();
        } catch (e) {
          console.error("Error during commit:", e);
          layoutSuccess = false;
        }
      }
      let chordsSuccess = await saveChords(updateProgress);

      if (layoutSuccess && settingsSuccess && chordsSuccess) {
        changes.set([]);
        needsSync = true;
      } else {
        throw new Error("Some changes could not be saved.");
      }
    } catch (e) {
      error = e as Error;
      console.error("Error while saving changes:", error);
      serialLog.update((log) => {
        log.push({ type: "system", value: error?.message ?? "Error" });
        return log;
      });
      goto("/terminal");
    } finally {
      $syncStatus = "done";
    }

    if (needsSync) {
      await sync();
    }
  }

  let progressPopover: HTMLElement | undefined = $state();
</script>

<button
  {@attach actionTooltip($LL.saveActions.UNDO(), "ctrl+z")}
  class="icon"
  disabled={$changes.length === 0}
  onclick={undo}>undo</button
>
<button
  {@attach actionTooltip($LL.saveActions.REDO(), "ctrl+y")}
  class="icon"
  disabled={redoQueue.length === 0}
  onclick={redo}>redo</button
>
{#if $changes.length !== 0 || $syncStatus === "uploading" || $syncStatus === "error"}
  <div
    transition:fly={{ x: 10 }}
    {@attach actionTooltip($LL.saveActions.SAVE(), "ctrl+shift+s")}
  >
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
      bind:element={progressButton}
    >
      <span class="icon">save</span>{$LL.saveActions.SAVE()}
    </ProgressButton>
    <div bind:this={progressPopover} popover="hint">
      {$LL.saveActions.SAVE()}
    </div>
  </div>
{/if}
