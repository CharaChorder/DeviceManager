import { buildParserFile } from "@lezer/generator";
import type { Plugin, Rollup } from "vite";

const fileRegex = /\.(grammar)$/;

export function lezerGrammarPlugin() {
  return {
    name: "lezer-grammar",
    transform(code, id) {
      if (fileRegex.test(id)) {
        return {
          code: buildParserFile(code).parser,
          map: null,
        } satisfies Rollup.TransformResult;
      }
      return null;
    },
  } satisfies Plugin;
}
