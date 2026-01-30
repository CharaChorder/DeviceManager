import { linter, type Diagnostic } from "@codemirror/lint";
import { parsedChordsField } from "./parsed-chords-plugin";

export function actionLinter(config?: Parameters<typeof linter>[1]) {
  const finalConfig: Parameters<typeof linter>[1] = {
    ...config,
    needsRefresh(update) {
      return (
        update.startState.field(parsedChordsField) !==
        update.state.field(parsedChordsField)
      );
    },
  };
  return linter((view) => {
    console.log("lint");
    const diagnostics: Diagnostic[] = [];
    const parsed = view.state.field(parsedChordsField);

    for (const chord of parsed.chords) {
      if (chord.disabled) {
        diagnostics.push({
          from: chord.range[0],
          to: chord.range[1],
          severity: "info",
          markClass: "chord-ignored",
          message: `Chord disabled`,
        });
      }
      if (chord.compounds) {
        for (const compound of chord.compounds) {
          if (compound.actions.length === 0 && compound.parent) {
            const replacement = view.state.doc.sliceString(
              compound.parent.range[0],
              compound.parent.input!.range[1],
            );
            diagnostics.push({
              from: compound.range[0],
              to: compound.range[1],
              severity: "warning",
              message: `Compound literal can be replaced with "${replacement}"`,
              actions: [
                {
                  name: "Replace",
                  apply(view, from, to) {
                    view.dispatch({
                      changes: {
                        from,
                        to,
                        insert: replacement + "|",
                      },
                    });
                  },
                },
              ],
            });
          }
        }
        const lastCompound = chord.compounds.at(-1);
        if (lastCompound) {
          const from = chord.range[0];
          const to = lastCompound.range[1];
          if (lastCompound.parent) {
            diagnostics.push({
              from,
              to,
              severity: "info",
              markClass: "chord-child",
              message: `Child of ${view.state.doc.sliceString(lastCompound.parent.range[0], lastCompound.parent.range[1])}`,
              actions: [
                {
                  name: "Select Parent",
                  apply(view) {
                    view.dispatch({
                      selection: {
                        anchor: lastCompound.parent!.range[0],
                      },
                      scrollIntoView: true,
                    });
                  },
                },
              ],
            });
          } else {
            diagnostics.push({
              from,
              to,
              severity: "warning",
              message: `Orphan compound`,
            });
          }
        }
      }
      if (chord.children) {
        diagnostics.push({
          from: chord.range[0],
          to: chord.range[1],
          severity: "info",
          markClass: "chord-parent",
          message: `Parent of ${chord.children.length} compound(s)`,
          actions: chord.children.map((child) => ({
            name: `Go to ${view.state.doc.sliceString(child.range[0], child.range[1])}`,
            apply(view) {
              view.dispatch({
                selection: {
                  anchor: child.range[0],
                },
                scrollIntoView: true,
              });
            },
          })),
        });
      }
      if (chord.phrase) {
        if (!chord.phrase.originalValue) {
          diagnostics.push({
            from: chord.range[0],
            to: chord.range[1],
            severity: "info",
            markClass: "chord-new",
            message: `New Chord`,
          });
        } else if (chord.phrase.originalValue !== chord.phrase.value) {
          diagnostics.push({
            from: chord.range[0],
            to: chord.range[1],
            severity: "info",
            markClass: "chord-unchanged",
            message: `Phrase changed`,
          });
        }

        if (chord.aliases) {
          diagnostics.push({
            from: chord.phrase.range[0],
            to: chord.phrase.range[1],
            severity: "warning",
            markClass: "chord-alias",
            message: `Alias of ${chord.aliases.length} chord(s)`,
            actions: chord.aliases.map((alias) => ({
              name: `Go to ${view.state.doc.sliceString(alias.range[0], alias.input?.range[1] ?? alias.range[1])}`,
              apply(view) {
                view.dispatch({
                  selection: {
                    anchor: alias.range[0],
                  },
                  scrollIntoView: true,
                });
              },
            })),
          });
        }
      }
    }
    return diagnostics;
  }, finalConfig);
}
