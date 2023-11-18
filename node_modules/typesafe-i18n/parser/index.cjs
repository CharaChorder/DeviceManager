"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.mts
var src_exports = {};
__export(src_exports, {
  experimentalParseMessage: () => parseMessage,
  experimentalSerializeMessage: () => serializeMessage
});
module.exports = __toCommonJS(src_exports);

// ../../node_modules/.pnpm/typesafe-utils@1.16.2/node_modules/typesafe-utils/lib/esm/isUndefined/isUndefined.js
var isNotUndefined = (value) => value !== void 0;

// ../../node_modules/.pnpm/typesafe-utils@1.16.2/node_modules/typesafe-utils/lib/esm/isString/isString.js
var isString = (value) => typeof value === "string";

// ../../node_modules/.pnpm/typesafe-utils@1.16.2/node_modules/typesafe-utils/lib/esm/pick/pick.js
var pick = (property) => (value) => value[property];

// ../../node_modules/.pnpm/typesafe-utils@1.16.2/node_modules/typesafe-utils/lib/esm/uniqueArray/uniqueArray.js
var uniqueArray = (array) => Array.from(new Set(array));

// src/basic.mts
var removeEmptyValues = (object) => Object.fromEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(object).map(([key, value]) => key !== "i" && value && value != "0" && [key, value]).filter(Boolean)
);
var trimAllValues = (part) => Object.fromEntries(
  Object.keys(part).map((key) => {
    const val = part[key];
    return [
      key,
      Array.isArray(val) ? val.map((v) => v?.trim()) : val === !!val ? val : val?.trim()
    ];
  })
);
var parseArgumentPart = (text) => {
  const [keyPart = "", ...formatterKeys] = text.split("|");
  const [keyWithoutType = "", type] = keyPart.split(":");
  const [key, isOptional] = keyWithoutType.split("?");
  return { k: key, i: type, n: isOptional === "", f: formatterKeys };
};
var isBasicPluralPart = (part) => !!(part.o || part.r);
var parsePluralPart = (content, lastAccessor) => {
  let [key, values] = content.split(":");
  if (!values) {
    values = key;
    key = lastAccessor;
  }
  const entries = values.split("|");
  const [zero, one, two, few, many, rest] = entries;
  const nrOfEntries = entries.filter((entry) => entry !== void 0).length;
  if (nrOfEntries === 1) {
    return { k: key, r: zero };
  }
  if (nrOfEntries === 2) {
    return { k: key, o: zero, r: one };
  }
  if (nrOfEntries === 3) {
    return { k: key, z: zero, o: one, r: two };
  }
  return { k: key, z: zero, o: one, t: two, f: few, m: many, r: rest };
};
var REGEX_SWITCH_CASE = /^\{.*\}$/;
var parseCases = (text) => Object.fromEntries(
  removeOuterBrackets(text).split(",").map((part) => part.split(":")).reduce(
    (accumulator, entry) => {
      if (entry.length === 2) {
        return [...accumulator, entry.map((entry2) => entry2.trim())];
      }
      ;
      accumulator[accumulator.length - 1][1] += "," + entry[0];
      return accumulator;
    },
    []
  )
);
var REGEX_BRACKETS_SPLIT = /(\{(?:[^{}]+|\{(?:[^{}]+)*\})*\})/g;
var removeOuterBrackets = (text) => text.substring(1, text.length - 1);
var parseRawText = (rawText, optimize = true, firstKey = "", lastKey = "") => rawText.split(REGEX_BRACKETS_SPLIT).map((part) => {
  if (!part.match(REGEX_BRACKETS_SPLIT)) {
    return part;
  }
  const content = removeOuterBrackets(part);
  if (content.startsWith("{")) {
    return parsePluralPart(removeOuterBrackets(content), lastKey);
  }
  const parsedPart = parseArgumentPart(content);
  lastKey = parsedPart.k || lastKey;
  !firstKey && (firstKey = lastKey);
  return parsedPart;
}).map((part) => {
  if (typeof part === "string")
    return part;
  if (!part.k)
    part.k = firstKey || "0";
  const trimmed = trimAllValues(part);
  return optimize ? removeEmptyValues(trimmed) : trimmed;
});

// src/advanced/parse.mts
var isTextPart = (part) => part.kind === "text";
var isPluralPart = (part) => part.kind === "plural";
var isParameterPart = (part) => part.kind === "parameter";
var isTransformParameterSwitchCasePart = (part) => part.kind === "switch-case";
var parseMessage = (message) => enhanceTypeInformation(parseRawText(message, false).map(createPart).filter(isNotUndefined));
var createPart = (part) => {
  if (isString(part)) {
    return part ? createTextPart(part) : void 0;
  }
  if (isBasicPluralPart(part))
    return createPluralPart(part);
  return createParameterPart(part);
};
var createTextPart = (content) => ({
  kind: "text",
  content
});
var createPluralPart = ({ k, z, o, t, f, m, r }) => ({
  kind: "plural",
  key: k,
  ...z ? { zero: z } : void 0,
  ...o ? { one: o } : void 0,
  ...t ? { two: t } : void 0,
  ...f ? { few: f } : void 0,
  ...m ? { many: m } : void 0,
  other: r
});
var createParameterPart = ({ k, i, n, f }) => ({
  kind: "parameter",
  key: k,
  types: i ? [i] : [],
  optional: n || false,
  transforms: (f || []).map(createTransformParameterPart)
});
var createTransformParameterPart = (transform) => {
  const isSwitchCase = transform.match(REGEX_SWITCH_CASE);
  return isSwitchCase ? {
    kind: "switch-case",
    cases: Object.entries(parseCases(transform)).map(([key, value]) => ({ key, value })),
    raw: transform
  } : {
    kind: "formatter",
    name: transform
  };
};
var enhanceTypeInformation = (parts) => {
  const parameterParts = parts.filter(isParameterPart);
  const pluralParts = parts.filter(isPluralPart);
  const typeMap = {};
  parameterParts.forEach(({ key, types, transforms, optional }) => {
    const enhancedTypes = types.length ? types : parseTypesFromSwitchCaseStatement(transforms);
    typeMap[key] = {
      types: uniqueArray([...typeMap[key]?.types || [], ...enhancedTypes]).filter(isNotUndefined),
      optional: typeMap[key]?.optional || optional
    };
  });
  pluralParts.forEach(({ key }) => {
    if (!typeMap[key]?.types.length) {
      typeMap[key] = { types: ["string", "number", "boolean"], optional: false };
    }
  });
  Object.keys(typeMap).forEach((key) => {
    if (!typeMap[key]?.types.length) {
      typeMap[key] = { types: ["unknown"], optional: typeMap[key]?.optional || false };
    }
  });
  Object.entries(typeMap).forEach(([key, value]) => {
    const part = parameterParts.find((p) => p.key === key);
    if (!part)
      return;
    part.types = value.types;
    part.optional = part.optional || value.optional;
  });
  return parts;
};
var parseTypesFromSwitchCaseStatement = (formatters) => {
  if (!formatters?.length)
    return [];
  const formatter = formatters[0];
  if (!isTransformParameterSwitchCasePart(formatter))
    return [];
  const keys = formatter.cases.map(pick("key"));
  return keys.map((key) => key === "*" ? "string" : `'${key}'`);
};

// src/advanced/serialize.mts
var serializeMessage = (parts) => parts.map(serializePart).join("");
var serializePart = (part) => {
  if (isTextPart(part))
    return part.content;
  if (isPluralPart(part))
    return serializePluralPart(part);
  return serializeParameterPart(part);
};
var serializePluralPart = ({ zero, one, two, few, many, other }) => `{{${[zero, one, two, few, many, other].filter((value) => value !== void 0).join("|")}}}`;
var serializeParameterPart = ({ key, optional, types, transforms }) => {
  const type = types.length === 1 ? types[0] === "unknown" ? void 0 : types[0] : void 0;
  return `{${key}${type ? `:${type}` : ""}${optional ? "?" : ""}${transforms.length ? `|${transforms.map(serializeTransformPart).join("|")}` : ""}}`;
};
var serializeTransformPart = (transform) => transform.kind === "formatter" ? transform.name : transform.raw || serializeTransformSwitchCasePart(transform);
var serializeTransformSwitchCasePart = (part) => `{${part.cases.map(({ key, value }) => `${key}:${value}`).join(",")}}`;
