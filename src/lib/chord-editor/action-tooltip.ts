import { hoverTooltip } from "@codemirror/view";
import { parsedChordsField } from "./parsed-chords-plugin";
import { type ActionMeta, iterActions } from "./parse-meta";
import { mount, unmount } from "svelte";
import ActionTooltip from "$lib/components/action/ActionTooltip.svelte";

function inRange(pos: number, side: 1 | -1, range: [number, number]) {
  if (side < 0) {
    return pos > range[0] && pos <= range[1];
  } else {
    return pos >= range[0] && pos < range[1];
  }
}

export const actionHover = hoverTooltip((view, pos, side) => {
  const chord = view.state
    .field(parsedChordsField)
    .chords.find((chord) => inRange(pos, side, chord.range));
  if (!chord) return null;
  let action = iterActions<ActionMeta>(chord, (action) =>
    inRange(pos, side, action.range) ? action : undefined,
  );
  if (!action?.info) return null;
  return {
    pos: action.range[0],
    end: action.range[1],
    create() {
      const dom = document.createElement("div");
      const element = mount(ActionTooltip, {
        target: dom,
        props: { info: action.info, valid: true },
      });
      return {
        dom,
        destroy() {
          unmount(element);
        },
      };
    },
  };
});
