import { d as deviceSettings, c as deviceLayout, b as deviceChords, p as persistentWritable } from "./connection.js";
import { d as derived } from "./index2.js";
import { K as KEYMAP_CODES } from "./keymap-codes.js";
const changes = persistentWritable("changes", []);
const overlay = derived(changes, (changes2) => {
  const overlay2 = {
    layout: [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()],
    chords: /* @__PURE__ */ new Map(),
    settings: /* @__PURE__ */ new Map()
  };
  for (const change of changes2) {
    switch (change.type) {
      case 0:
        overlay2.layout[change.layer].set(change.id, change.action);
        break;
      case 1:
        overlay2.chords.set(JSON.stringify(change.id), { actions: change.actions, phrase: change.phrase });
        break;
      case 2:
        overlay2.settings.set(change.id, change.setting);
        break;
    }
  }
  return overlay2;
});
const settings = derived(
  [overlay, deviceSettings],
  ([overlay2, settings2]) => settings2.map((value, id) => ({
    value: overlay2.settings.get(id) ?? value,
    isApplied: !overlay2.settings.has(id)
  }))
);
const layout = derived(
  [overlay, deviceLayout],
  ([overlay2, layout2]) => layout2.map(
    (actions, layer) => actions.map((action, id) => ({
      action: overlay2.layout[layer].get(id) ?? action,
      isApplied: !overlay2.layout[layer].has(id)
    }))
  )
);
const chords = derived([overlay, deviceChords], ([overlay2, chords2]) => {
  const newChords = new Set(overlay2.chords.keys());
  const changedChords = chords2.map((chord) => {
    const id = JSON.stringify(chord.actions);
    if (overlay2.chords.has(id)) {
      newChords.delete(id);
      const changedChord = overlay2.chords.get(id);
      return {
        id: chord.actions,
        // use the old phrase for stable editing
        sortBy: chord.phrase.map((it) => KEYMAP_CODES[it].id || it).join(),
        actions: changedChord.actions,
        phrase: changedChord.phrase,
        actionsChanged: id !== JSON.stringify(changedChord.actions),
        phraseChanged: JSON.stringify(chord.phrase) !== JSON.stringify(changedChord.phrase),
        isApplied: false
      };
    } else {
      return {
        id: chord.actions,
        sortBy: chord.phrase.map((it) => KEYMAP_CODES[it].id || it).join(),
        actions: chord.actions,
        phrase: chord.phrase,
        phraseChanged: false,
        actionsChanged: false,
        isApplied: true
      };
    }
  });
  for (const id of newChords) {
    const chord = overlay2.chords.get(id);
    changedChords.push({
      sortBy: "",
      isApplied: false,
      actionsChanged: true,
      phraseChanged: false,
      id: JSON.parse(id),
      phrase: chord.phrase,
      actions: chord.actions
    });
  }
  return changedChords.sort(({ sortBy: a }, { sortBy: b }) => a.localeCompare(b));
});
export {
  chords as a,
  changes as c,
  layout as l,
  overlay as o,
  settings as s
};
