<script lang="ts">
  import LL from "$i18n/i18n-svelte";
  import {
    changes,
    ChangeType,
    chords,
    layout,
    overlay,
    settings,
  } from "$lib/undo-redo";
  import type { Change } from "$lib/undo-redo";
  import { fly } from "svelte/transition";
  import { action } from "$lib/title";
  import {
    deviceChords,
    deviceLayout,
    deviceSettings,
    serialPort,
    syncProgress,
    syncStatus,
  } from "$lib/serial/connection";
  import { askForConfirmation } from "$lib/dialogs/confirm-dialog";

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

  async function save() {
    try {
      const port = $serialPort;
      if (!port) return;
      $syncStatus = "uploading";

      const layoutChanges = $overlay.layout.reduce(
        (acc, profile) =>
          acc + profile.reduce((acc, layer) => acc + layer.size, 0),
        0,
      );
      const settingChanges = $overlay.settings.reduce(
        (acc, profile) => acc + profile.size,
        0,
      );
      const chordChanges = $overlay.chords.size;
      const needsCommit = settingChanges > 0 || layoutChanges > 0;
      const progressMax = layoutChanges + settingChanges + chordChanges;

      let progressCurrent = 0;

      syncProgress.set({
        max: progressMax,
        current: progressCurrent,
      });

      console.log($overlay);

      for (const [id, chord] of $overlay.chords) {
        if (!chord.deleted) {
          if (id !== JSON.stringify(chord.actions)) {
            const existingChord = await port.getChordPhrase(chord.actions);
            if (
              existingChord !== undefined &&
              !(await askForConfirmation(
                $LL.configure.chords.conflict.TITLE(),
                $LL.configure.chords.conflict.DESCRIPTION(),
                $LL.configure.chords.conflict.CONFIRM(),
                $LL.configure.chords.conflict.ABORT(),
                chord,
              ))
            ) {
              changes.update((changes) =>
                changes
                  .map((it) =>
                    it.filter(
                      (it) =>
                        !(
                          it.type === ChangeType.Chord &&
                          JSON.stringify(it.id) === id
                        ),
                    ),
                  )
                  .filter((it) => it.length > 0),
              );
              continue;
            }

            await port.deleteChord({ actions: JSON.parse(id) });
          }
          await port.setChord({ actions: chord.actions, phrase: chord.phrase });
        } else {
          await port.deleteChord({ actions: chord.actions });
        }
        syncProgress.set({
          max: progressMax,
          current: progressCurrent++,
        });
      }

      for (const [profile, layout] of $overlay.layout.entries()) {
        if (layout === undefined) continue;
        for (const [layer, actions] of layout.entries()) {
          if (actions === undefined) continue;
          for (const [id, action] of actions) {
            if (action === undefined) continue;
            await port.setLayoutKey(profile, layer + 1, id, action);
            syncProgress.set({
              max: progressMax,
              current: progressCurrent++,
            });
          }
        }
      }

      for (const [profile, settings] of $overlay.settings.entries()) {
        if (settings === undefined) continue;
        for (const [id, setting] of settings.entries()) {
          if (setting === undefined) continue;
          await port.setSetting(profile, id, setting);
          syncProgress.set({
            max: progressMax,
            current: progressCurrent++,
          });
        }
      }

      // Yes, this is a completely arbitrary and unnecessary delay.
      // The only purpose of it is to create a sense of weight,
      // aka make it more "energy intensive" to click.
      // The only conceivable way users could reach the commit limit in this case
      // would be if they click it every time they change a setting.
      // Because of that, we don't need to show a fearmongering message such as
      // "Your device will break after you click this 10,000 times!"
      if (needsCommit) {
        await port.commit();
      }

      $deviceLayout = $layout.map((profile) =>
        profile.map((layer) => layer.map<number>(({ action }) => action)),
      );
      $deviceChords = $chords
        .filter(({ deleted }) => !deleted)
        .map(({ actions, phrase }) => ({ actions, phrase }));
      $deviceSettings = $settings.map((profile) =>
        profile.map(({ value }) => value),
      );
      $changes = [];
    } catch (e) {
      alert(e);
      console.error(e);
    } finally {
      $syncStatus = "done";
    }
  }
</script>

<button
  use:action={{ title: $LL.saveActions.UNDO(), shortcut: "ctrl+z" }}
  class="icon"
  disabled={$changes.length === 0}
  onclick={undo}>undo</button
>
<button
  use:action={{ title: $LL.saveActions.REDO(), shortcut: "ctrl+y" }}
  class="icon"
  disabled={redoQueue.length === 0}
  onclick={redo}>redo</button
>
{#if $changes.length !== 0}
  <button
    transition:fly={{ x: 10 }}
    use:action={{ title: $LL.saveActions.SAVE(), shortcut: "ctrl+shift+s" }}
    onclick={save}
    class="click-me"
    ><span class="icon">save</span>{$LL.saveActions.SAVE()}</button
  >
{/if}

<style lang="scss">
  .click-me {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-inline: 8px;
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: 2px;
    border: 2px solid var(--md-sys-color-primary);
    border-radius: 18px;
    padding-inline-start: 8px;
    padding-inline-end: 12px;
    padding-block: 2px;
    height: fit-content;
    color: var(--md-sys-color-primary);
    font-weight: bold;
    font-family: inherit;
  }
</style>
