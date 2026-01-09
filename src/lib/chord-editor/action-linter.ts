import {
  KEYMAP_CODES,
  KEYMAP_IDS,
  type KeyInfo,
} from "$lib/serial/keymap-codes";
import { syntaxTree } from "@codemirror/language";
import { linter, type Diagnostic } from "@codemirror/lint";
import { derived, get } from "svelte/store";
import { parseCharaChords } from "./action-serializer";
import { deviceChords } from "$lib/serial/connection";

export const actionLinterDependencies = derived(
  [KEYMAP_IDS, KEYMAP_CODES, deviceChords],
  (it) => it,
);

export const actionLinter = linter(
  (view) => {
    const diagnostics: Diagnostic[] = [];
    const [ids, codes, deviceChords] = get(actionLinterDependencies);

    const { meta, compoundInputs } = parseCharaChords(view.state, ids);

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
          to: m.to,
          severity: "warning",
          message: `Chord phrase is empty`,
        });
      }
      if (m.overriddenBy) {
        diagnostics.push({
          from: m.from,
          to: m.to,
          severity: "warning",
          message: `Chord overridden by previous chord`,
        });
      }
      if (m.orphan) {
        diagnostics.push({
          from: m.from,
          to: m.to,
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
          to: m.to,
          severity: "info",
          message: `Chord overrides other chords`,
        });
      }
    }

    return diagnostics;
  },
  { delay: 100 },
);
