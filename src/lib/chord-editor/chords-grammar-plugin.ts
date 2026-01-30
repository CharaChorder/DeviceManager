import { parser } from "./chords.grammar";
import {
  LRLanguage,
  LanguageSupport,
  HighlightStyle,
} from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";

export const chordHighlightStyle = HighlightStyle.define([
  {
    tag: tags.keyword,
    paddingInline: "2px",
    opacity: "0.5",
  },
  {
    tag: tags.className,
    backgroundColor:
      "color-mix(in srgb, var(--md-sys-color-surface-variant) 50%, transparent)",
    borderRadius: "4px",
    paddingInline: "4px",
    marginInline: "-4px",
  },
  {
    tag: tags.integer,
    color: "var(--md-sys-color-tertiary)",
  },
  {
    tag: tags.angleBracket,
    opacity: "0.5",
  },
  { tag: tags.modifier, opacity: "0.25" },
  { tag: tags.escape, color: "var(--md-sys-color-primary)" },
  { tag: tags.strong, fontWeight: "bold" },
]);

export const chordLanguage = LRLanguage.define({
  name: "chords",
  parser: parser.configure({
    props: [
      styleTags({
        "PhraseDelim CompoundDelim": [tags.keyword, tags.strong],
        "HexNumber DecimalNumber": [tags.className, tags.integer],
        "ExplicitDelimStart ExplicitDelimEnd": tags.angleBracket,
        ActionId: tags.className,
        EscapedLetter: tags.escape,
        Escape: [tags.escape, tags.modifier],
      }),
    ],
  }),
});

export function chordLanguageSupport() {
  return new LanguageSupport(chordLanguage, [chordLanguage.data.of({})]);
}
