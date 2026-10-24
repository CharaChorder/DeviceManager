import { describe, expect, it } from "vitest";
import { parser } from "./chords.grammar";

/**
 * The generated Lezer parser for the chord editor's text format:
 * `chord-input => phrase` lines, with `+>` compound delimiters,
 * `<...>` explicit action ids, and `\\x` escaped letters.
 */

function names(doc: string): string[] {
  const found: string[] = [];
  parser.parse(doc).iterate({
    enter: (node) => {
      found.push(node.name);
    },
  });
  return found;
}

function nodes(doc: string, name: string): { from: number; to: number }[] {
  const found: { from: number; to: number }[] = [];
  parser.parse(doc).iterate({
    enter: (node) => {
      if (node.name === name) found.push({ from: node.from, to: node.to });
    },
  });
  return found;
}

describe("chords.grammar", () => {
  it("parses a plain chord into input and phrase", () => {
    const doc = "ab=>cd";
    const tree = parser.parse(doc);
    expect(tree.topNode.name).toBe("Program");
    const chord = tree.topNode.getChild("Chord");
    expect(chord).not.toBeNull();
    const input = chord!.getChild("ChordInput");
    const phrase = chord!.getChild("ChordPhrase");
    expect(doc.slice(input!.from, input!.to)).toBe("ab");
    expect(doc.slice(phrase!.from, phrase!.to)).toBe("cd");
    expect(chord!.getChild("PhraseDelim")).not.toBeNull();
  });

  it("parses compound chord inputs around +> delimiters", () => {
    const doc = "a+>b=>cd";
    const tree = parser.parse(doc);
    const input = tree.topNode.getChild("Chord")!.getChild("ChordInput")!;
    const actionStrings = input.getChildren("ActionString");
    expect(actionStrings).toHaveLength(2);
    expect(doc.slice(actionStrings[0]!.from, actionStrings[0]!.to)).toBe("a");
    expect(doc.slice(actionStrings[1]!.from, actionStrings[1]!.to)).toBe("b");
    expect(input.getChild("CompoundDelim")).not.toBeNull();
  });

  it("parses explicit actions with decimal, hex, and id payloads", () => {
    const doc = "<65><0x20><LEFT_SHIFT>=>x";
    expect(nodes(doc, "ExplicitAction")).toHaveLength(3);
    const decimal = nodes(doc, "DecimalNumber");
    expect(decimal).toHaveLength(1);
    expect(doc.slice(decimal[0]!.from, decimal[0]!.to)).toBe("65");
    const hex = nodes(doc, "HexNumber");
    expect(hex).toHaveLength(1);
    expect(doc.slice(hex[0]!.from, hex[0]!.to)).toBe("0x20");
    const id = nodes(doc, "ActionId");
    expect(id).toHaveLength(1);
    expect(doc.slice(id[0]!.from, id[0]!.to)).toBe("LEFT_SHIFT");
  });

  it("parses escaped single letters", () => {
    const found = names("\\a\\b=>z");
    expect(found).toContain("EscapedSingleAction");
    expect(found.filter((it) => it === "EscapedSingleAction")).toHaveLength(2);
  });

  it("parses multiple chords per program", () => {
    const tree = parser.parse("ab=>cd\nef=>gh");
    const chords = tree.topNode.getChildren("Chord");
    expect(chords).toHaveLength(2);
  });

  it("accepts a trailing chord at end of input", () => {
    const tree = parser.parse("ab=>cd");
    const chord = tree.topNode.getChild("Chord");
    expect(chord).not.toBeNull();
    expect(chord!.to).toBe(tree.topNode.to);
  });

  it("parses the empty document as an empty program", () => {
    const tree = parser.parse("");
    expect(tree.topNode.name).toBe("Program");
    expect(tree.topNode.getChild("Chord")).toBeNull();
  });
});
