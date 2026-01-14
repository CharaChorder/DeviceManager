import { type KeyInfo } from "$lib/serial/keymap-codes";
import { syntaxTree } from "@codemirror/language";
import { linter, type Diagnostic } from "@codemirror/lint";
import { parsedChordsField } from "./parsed-chords-plugin";
import { actionMetaPlugin } from "./action-meta-plugin";

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
    }
    return diagnostics;

    syntaxTree(view.state)
      .cursor()
      .iterate((node) => {
        let action: KeyInfo | undefined = undefined;
        switch (node.name) {
          case "SingleLetter": {
            action = ids.get(view.state.doc.sliceString(node.from, node.to));
            break;
          }
          case "ActionId": {
            action = ids.get(view.state.doc.sliceString(node.from, node.to));
            break;
          }
          case "HexNumber": {
            const hexString = view.state.doc.sliceString(node.from, node.to);
            const code = Number.parseInt(hexString, 16);
            if (hexString.length === 10) {
              if (compoundInputs.has(code)) {
                diagnostics.push({
                  from: node.from,
                  to: node.to,
                  severity: "info",
                  message: "Compound hash literal can be expanded",
                  actions: [
                    {
                      name: "Expand",
                      apply(view, from, to) {
                        view.dispatch({
                          changes: {
                            from: from - 1,
                            to: to + 1,
                            insert: compoundInputs.get(code)! + "|",
                          },
                        });
                      },
                    },
                  ],
                });
              }
              return;
            }

            if (!(code >= 0 && code <= 1023)) {
              diagnostics.push({
                from: node.from,
                to: node.to,
                severity: "error",
                message: "Hex code invalid (out of range)",
                actions: [
                  {
                    name: "Remove",
                    apply(view, from, to) {
                      view.dispatch({ changes: { from, to } });
                    },
                  },
                ],
              });
              return;
            }

            action = codes.get(code);
            break;
          }
          default:
            return;
        }
        if (!action) {
          const action = view.state.doc.sliceString(node.from, node.to);
          diagnostics.push({
            from: node.from,
            to: node.to,
            severity: node.name === "HexNumber" ? "warning" : "error",
            message: `Unknown action: ${action}`,
            actions: [
              ...(node.name === "SingleLetter"
                ? ([
                    {
                      name: "Generate Windows Hex Numpad Code",
                      apply(view, from, to) {
                        view.dispatch({
                          changes: {
                            from,
                            to,
                            insert:
                              "<PRESS_NEXT><LEFT_ALT><KP_PLUS>" +
                              action
                                .codePointAt(0)!
                                .toString(16)
                                .split("")
                                .map((c) =>
                                  /^\d$/.test(c)
                                    ? `<KP_${c}>`
                                    : c.toLowerCase(),
                                )
                                .join("") +
                              "<RELEASE_NEXT><LEFT_ALT>",
                          },
                        });
                      },
                    },
                  ] satisfies Diagnostic["actions"])
                : []),
            ],
          });
        }
      });

    for (const m of meta) {
      if (m.invalidActions) {
        diagnostics.push({
          from: m.from,
          to: m.to,
          severity: "error",
          markClass: "chord-invalid",
          message: `Chord contains invalid actions`,
        });
      }
      if (m.invalidInput) {
        diagnostics.push({
          from: m.from,
          to: m.to,
          severity: "error",
          markClass: "chord-invalid",
          message: `Chord input is invalid`,
        });
      }
      if (m.emptyPhrase) {
        diagnostics.push({
          from: m.from,
          to: m.from,
          severity: "warning",
          message: `Chord phrase is empty`,
        });
      }
      if (m.overriddenBy) {
        diagnostics.push({
          from: m.from,
          to: m.from,
          severity: "warning",
          message: `Chord overridden by previous chord`,
        });
      }
      if (m.orphan) {
        diagnostics.push({
          from: m.from,
          to: m.from,
          severity: "warning",
          message: `Orphan compound chord`,
        });
      }
      if (m.disabled) {
        diagnostics.push({
          from: m.from,
          to: m.to,
          severity: "info",
          markClass: "chord-ignored",
          message: `Chord disabled`,
        });
      }
      if ((m.overrides?.length ?? 0) > 0) {
        diagnostics.push({
          from: m.from,
          to: m.from,
          severity: "info",
          message: `Chord overrides other chords`,
        });
      }
      if (m.originalPhrase) {
        diagnostics.push({
          from: m.from,
          to: m.to,
          severity: "info",
          message: `Chord phrase changed from "${m.originalPhrase}"`,
        });
      }
    }

    return diagnostics;
  }, finalConfig);
}
