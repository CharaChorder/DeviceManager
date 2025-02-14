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
      }

      for (const [layer, actions] of $overlay.layout.entries()) {
        for (const [id, action] of actions) {
          await port.setLayoutKey(layer + 1, id, action);
        }
      }

      for (const [id, setting] of $overlay.settings) {
        await port.setSetting(id, setting);
      }

      // Yes, this is a completely arbitrary and unnecessary delay.
      // The only purpose of it is to create a sense of weight,
      // aka make it more "energy intensive" to click.
      // The only conceivable way users could reach the commit limit in this case
      // would be if they click it every time they change a setting.
      // Because of that, we don't need to show a fearmongering message such as
      // "Your device will break after you click this 10,000 times!"
      const virtualWriteTime = 1000;
      const startStamp = performance.now();
      await new Promise<void>((resolve) => {
        function animate() {
          const delta = performance.now() - startStamp;
          syncProgress.set({
            max: virtualWriteTime,
            current: delta,
          });
          if (delta >= virtualWriteTime) {
            resolve();
          } else {
            requestAnimationFrame(animate);
          }
        }
        requestAnimationFrame(animate);
      });
      await port.commit();

      $deviceLayout = $layout.map((layer) =>
        layer.map<number>(({ action }) => action),
      ) as [number[], number[], number[]];
      $deviceChords = $chords
        .filter(({ deleted }) => !deleted)
        .map(({ actions, phrase }) => ({ actions, phrase }));
      $deviceSettings = $settings.map(({ value }) => value);
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
    align-items: center;
    justify-content: center;
    height: fit-content;
    margin-inline: 8px;
    padding-block: 2px;
    padding-inline-start: 8px;
    padding-inline-end: 12px;
    font-family: inherit;
    font-weight: bold;
    color: var(--md-sys-color-primary);
    border: 2px solid var(--md-sys-color-primary);
    border-radius: 18px;
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: 2px;
  }
</style>
