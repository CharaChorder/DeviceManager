<script lang="ts">
  import Dialog from "$lib/dialogs/Dialog.svelte";
  import type {
    Change,
    ChordChange,
    LayoutChange,
    SettingChange,
  } from "$lib/undo-redo";
  import { ChangeType, chords } from "$lib/undo-redo";
  import ActionString from "$lib/components/ActionString.svelte";
  import LL from "../../i18n/i18n-svelte";
  import { KEYMAP_IDS } from "$lib/serial/keymap-codes";

  export let changes: Change[] = [
    { type: ChangeType.Layout, layer: 0, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Layout, layer: 1, id: 1, action: 1 },
    { type: ChangeType.Setting, id: 0, setting: 2 },
    { type: ChangeType.Setting, id: 0, setting: 2 },
    { type: ChangeType.Setting, id: 0, setting: 2 },
    { type: ChangeType.Setting, id: 0, setting: 2 },
    {
      type: ChangeType.Chord,
      id: [1],
      actions: [55],
      phrase: [55, 63, 37, 36],
    },
    {
      type: ChangeType.Chord,
      id: [
        KEYMAP_IDS.get("y")!.code,
        KEYMAP_IDS.get("r")!.code,
        KEYMAP_IDS.get("t")!.code,
      ],
      actions: [
        KEYMAP_IDS.get("y")!.code,
        KEYMAP_IDS.get("r")!.code,
        KEYMAP_IDS.get("t")!.code,
      ],
      phrase: [55, 63, 37, 36],
    },
    {
      type: ChangeType.Chord,
      id: [
        KEYMAP_IDS.get("y")!.code,
        KEYMAP_IDS.get("r")!.code,
        KEYMAP_IDS.get("t")!.code,
      ],
      actions: [
        KEYMAP_IDS.get("y")!.code,
        KEYMAP_IDS.get("r")!.code,
        KEYMAP_IDS.get("t")!.code,
      ],
      phrase: [],
    },
  ];

  $: existingChords = new Set($chords.map((it) => JSON.stringify(it.id)));

  $: layoutChanges = Array.from(
    { length: 3 },
    (_, i) =>
      changes.filter(
        (it) => it.type === ChangeType.Layout && it.layer === i,
      ) as LayoutChange[],
  );
  $: settingChanges = changes.filter(
    (it) => it.type === ChangeType.Setting,
  ) as SettingChange[];
  $: chordChanges = {
    added: changes.filter(
      (it) =>
        it.type === ChangeType.Chord &&
        it.phrase.length > 0 &&
        !existingChords.has(JSON.stringify(it.id)),
    ) as ChordChange[],
    changed: changes.filter(
      (it) =>
        it.type === ChangeType.Chord &&
        it.phrase.length > 0 &&
        existingChords.has(JSON.stringify(it.id)),
    ) as ChordChange[],
    deleted: changes.filter(
      (it) => it.type === ChangeType.Chord && it.phrase.length === 0,
    ) as ChordChange[],
  };
  $: totalChordChanges = Object.values(chordChanges).reduce(
    (acc, curr) => acc + curr.length,
    0,
  );
</script>

<Dialog>
  <h1>{$LL.changes.TITLE()}</h1>
  <h2>
    <label
      ><input
        type="checkbox"
        class="checkbox"
      />{$LL.changes.ALL_CHANGES()}</label
    >
  </h2>
  <ul>
    {#if layoutChanges.some((it) => it.length > 0)}
      <li>
        <h3>
          <label>
            <input type="checkbox" class="checkbox" />
            {$LL.changes.layout.TITLE(
              layoutChanges.reduce((acc, curr) => acc + curr.length, 0),
            )}
          </label>
        </h3>
        <ul>
          {#each layoutChanges
            .map((it, i) => /** @type {const} */ ([it, i + 1]))
            .filter(([it]) => it.length > 0) as [changes, layer]}
            <li>
              <h4>
                <label>
                  <input type="checkbox" class="checkbox" />
                  {$LL.changes.layout.LAYER({ changes: changes.length, layer })}
                </label>
              </h4>
            </li>
          {/each}
        </ul>
      </li>
    {/if}
    {#if settingChanges.length > 0}
      <li>
        <h3>
          <label
            ><input
              type="checkbox"
              class="checkbox"
            />{$LL.changes.settings.TITLE(settingChanges.length)}</label
          >
        </h3>
      </li>
    {/if}
    {#if totalChordChanges > 0}
      <li>
        <h3>
          <label
            ><input
              type="checkbox"
              class="checkbox"
            />{$LL.changes.chords.TITLE(totalChordChanges)}</label
          >
        </h3>
        <ul>
          {#each Object.entries(chordChanges) as [category, changes]}
            {#if changes.length > 0}
              <li>
                <h4>
                  <label
                    ><input type="checkbox" class="checkbox" />
                    {#if category === "added"}
                      {$LL.changes.chords.NEW_CHORDS(changes.length)}
                    {:else if category === "changed"}
                      {$LL.changes.chords.CHANGED_CHORDS(changes.length)}
                    {:else if category === "deleted"}
                      {$LL.changes.chords.DELETED_CHORDS(changes.length)}
                    {/if}
                  </label>
                </h4>
                <ul>
                  {#each changes as change}
                    <li>
                      <label>
                        <input type="checkbox" class="checkbox" />
                        <ActionString display="keys" actions={change.actions} />
                        <ActionString actions={change.phrase} />
                      </label>
                    </li>
                  {/each}
                </ul>
              </li>
            {/if}
          {/each}
        </ul>
      </li>
    {/if}
  </ul>
</Dialog>

<style lang="scss">
  h1 {
    font-size: 2em;
    text-align: center;
  }

  h2 {
    font-size: 1.5em;
  }

  ul {
    padding-inline-start: 0;
    list-style: none;
  }

  li {
    margin-inline-start: 24px;
  }
</style>
