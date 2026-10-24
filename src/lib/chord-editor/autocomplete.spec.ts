import { describe, expect, it } from "vitest";
import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { get } from "svelte/store";
import { actionAutocomplete, actionAutocompleteItems } from "./autocomplete";
import { chordLanguageSupport } from "./chords-grammar-plugin";

/**
 * The action autocompletion offers every keymap action as a completion.
 * Ids that are valid bare identifiers complete into `<ID>`; exotic ids
 * fall back to hexadecimal `<0x..>` payloads.
 */

describe("actionAutocompleteItems", () => {
  const items = get(actionAutocompleteItems);

  it("offers every mapped action", () => {
    expect(items.length).toBeGreaterThan(100);
  });

  it("uses identifier ids in the apply payload", () => {
    const ctrl = items.find((it) => it.apply === "LEFT_CTRL>");
    expect(ctrl).toBeDefined();
    // usable ids show title + variant, not the quoted id
    expect(String(ctrl!.label)).toBe("Control Keyboard Modifier Left");
    expect(ctrl!.detail).toBe("<LEFT_CTRL>");
    expect(ctrl!.section).toMatchObject({ name: "Keyboard" });
  });

  it("falls back to hex for non-identifier ids", () => {
    const quote = items.find((it) => it.apply === "0x27>");
    expect(quote).toBeDefined();
    expect(String(quote!.label)).toContain(`"'"`);
    expect(quote!.detail).toBe("'");
  });

  it("uses the bare letter for single-character actions", () => {
    const letter = items.find((it) => it.detail === "a");
    expect(letter).toBeDefined();
    expect(letter!.apply).toBe("a>");
  });
});

describe("actionAutocomplete source", () => {
  const state = EditorState.create({
    doc: "<LEFT",
    extensions: [chordLanguageSupport()],
  });

  it("completes after an explicit action delimiter", () => {
    const result = actionAutocomplete(new CompletionContext(state, 1, true));
    expect(result).not.toBeNull();
    expect(result!.from).toBe(1);
    expect(result!.options.length).toBeGreaterThan(0);
    expect(result!.validFor).toBeInstanceOf(RegExp);
  });

  it("completes over a typed action id", () => {
    const result = actionAutocomplete(new CompletionContext(state, 5, true));
    expect(result).not.toBeNull();
    expect(result!.from).toBe(1);
  });

  it("returns null where no word is under the cursor", () => {
    const blank = EditorState.create({
      doc: " ",
      extensions: [chordLanguageSupport()],
    });
    expect(
      actionAutocomplete(new CompletionContext(blank, 1, true)),
    ).toBeNull();
  });
});
