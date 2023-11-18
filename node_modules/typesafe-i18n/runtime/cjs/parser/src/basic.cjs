"use strict";
// --------------------------------------------------------------------------------------------------------------------
// types --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRawText = exports.removeOuterBrackets = exports.parseCases = exports.REGEX_SWITCH_CASE = exports.isBasicPluralPart = void 0;
// --------------------------------------------------------------------------------------------------------------------
// implementation -----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
// eslint-disable-next-line prettier/prettier
const removeEmptyValues = (object) => Object.fromEntries(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.entries(object)
    .map(([key, value]) => key !== 'i' && value && value != '0' && [key, value])
    .filter(Boolean));
// --------------------------------------------------------------------------------------------------------------------
const trimAllValues = (part) => Object.fromEntries(Object.keys(part).map((key) => {
    const val = part[key];
    return [
        key,
        Array.isArray(val) ? val.map((v) => v === null || v === void 0 ? void 0 : v.trim()) : val === !!val ? val : val === null || val === void 0 ? void 0 : val.trim(),
    ];
}));
// --------------------------------------------------------------------------------------------------------------------
const parseArgumentPart = (text) => {
    const [keyPart = '', ...formatterKeys] = text.split('|');
    const [keyWithoutType = '', type] = keyPart.split(':');
    const [key, isOptional] = keyWithoutType.split('?');
    return { k: key, i: type, n: isOptional === '', f: formatterKeys };
};
// --------------------------------------------------------------------------------------------------------------------
const isBasicPluralPart = (part) => !!(part.o || part.r);
exports.isBasicPluralPart = isBasicPluralPart;
const parsePluralPart = (content, lastAccessor) => {
    let [key, values] = content.split(':');
    if (!values) {
        values = key;
        key = lastAccessor;
    }
    const entries = values.split('|');
    const [zero, one, two, few, many, rest] = entries;
    const nrOfEntries = entries.filter((entry) => entry !== undefined).length;
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
// --------------------------------------------------------------------------------------------------------------------
exports.REGEX_SWITCH_CASE = /^\{.*\}$/;
const parseCases = (text) => Object.fromEntries((0, exports.removeOuterBrackets)(text)
    .split(',')
    .map((part) => part.split(':'))
    .reduce((accumulator, entry) => {
    if (entry.length === 2) {
        return [...accumulator, entry.map((entry) => entry.trim())];
    }
    // if we have a single part, this means that a comma `,` was present in the string and we need to combine the strings again
    ;
    accumulator[accumulator.length - 1][1] += ',' + entry[0];
    return accumulator;
}, []));
exports.parseCases = parseCases;
// --------------------------------------------------------------------------------------------------------------------
const REGEX_BRACKETS_SPLIT = /(\{(?:[^{}]+|\{(?:[^{}]+)*\})*\})/g;
const removeOuterBrackets = (text) => text.substring(1, text.length - 1);
exports.removeOuterBrackets = removeOuterBrackets;
const parseRawText = (rawText, optimize = true, firstKey = '', lastKey = '') => rawText
    .split(REGEX_BRACKETS_SPLIT)
    .map((part) => {
    if (!part.match(REGEX_BRACKETS_SPLIT)) {
        return part;
    }
    const content = (0, exports.removeOuterBrackets)(part);
    if (content.startsWith('{')) {
        return parsePluralPart((0, exports.removeOuterBrackets)(content), lastKey);
    }
    const parsedPart = parseArgumentPart(content);
    lastKey = parsedPart.k || lastKey;
    !firstKey && (firstKey = lastKey);
    return parsedPart;
})
    .map((part) => {
    if (typeof part === 'string')
        return part;
    if (!part.k)
        part.k = firstKey || '0';
    const trimmed = trimAllValues(part);
    return optimize ? removeEmptyValues(trimmed) : trimmed;
});
exports.parseRawText = parseRawText;
