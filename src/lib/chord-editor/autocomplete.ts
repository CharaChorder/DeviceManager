import { KEYMAP_CATEGORIES, KEYMAP_CODES } from "$lib/serial/keymap-codes";
import type {
  Completion,
  CompletionSection,
  CompletionSource,
} from "@codemirror/autocomplete";
import { derived, get } from "svelte/store";
import { actionToValue, canUseIdAsString } from "./action-serializer";

const completionSections = derived(
  KEYMAP_CATEGORIES,
  (categories) =>
    new Map(
      categories.map(
        (category) =>
          [
            category,
            {
              name: category.name,
            } satisfies CompletionSection,
          ] as const,
      ),
    ),
);

export const actionAutocompleteItems = derived(
  [KEYMAP_CODES, completionSections],
  ([codes, sections]) =>
    codes
      .values()
      .map((info) => {
        const canUseId = canUseIdAsString(info);
        const completionValue =
          (canUseId && info.id) ||
          `0x${info.code.toString(16).padStart(2, "0")}`;
        return {
          label:
            [
              canUseId || !info.id ? undefined : `"${info.id}"`,
              info.title,
              info.variant?.replace(/^[a-z]/g, (c) => c.toUpperCase()),
            ]
              .filter(Boolean)
              .join(" ") || completionValue,
          detail: actionToValue(info),
          section: info.category ? sections.get(info.category) : undefined,
          info: info.description,
          type: "keyword",
          apply: completionValue + ">",
        } satisfies Completion;
      })
      .filter(
        (item) => typeof item.label === "string" && item.apply !== undefined,
      )
      .toArray(),
);

export const actionAutocomplete = ((context) => {
  let word = context.tokenBefore([
    "ExplicitDelimStart",
    "ActionId",
    "HexNumber",
    "DecimalNumber",
  ]);
  if (!word) return null;
  console.log(get(actionAutocompleteItems));
  return {
    from: word.type.name === "ExplicitDelimStart" ? word.to : word.from,
    validFor: /^<?[a-zA-Z0-9_]*$/,
    options: get(actionAutocompleteItems),
  };
}) satisfies CompletionSource;
