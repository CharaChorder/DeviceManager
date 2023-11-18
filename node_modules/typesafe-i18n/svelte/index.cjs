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
  initI18nSvelte: () => initI18nSvelte
});
module.exports = __toCommonJS(src_exports);

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/internal/utils.js
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
}

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/internal/globals.js
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  global
);

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/internal/ResizeObserverSingleton.js
var ResizeObserverSingleton = class _ResizeObserverSingleton {
  /**
   * @private
   * @readonly
   * @type {WeakMap<Element, import('./private.js').Listener>}
   */
  _listeners = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
  /**
   * @private
   * @type {ResizeObserver}
   */
  _observer = void 0;
  /** @type {ResizeObserverOptions} */
  options;
  /** @param {ResizeObserverOptions} options */
  constructor(options) {
    this.options = options;
  }
  /**
   * @param {Element} element
   * @param {import('./private.js').Listener} listener
   * @returns {() => void}
   */
  observe(element2, listener) {
    this._listeners.set(element2, listener);
    this._getObserver().observe(element2, this.options);
    return () => {
      this._listeners.delete(element2);
      this._observer.unobserve(element2);
    };
  }
  /**
   * @private
   */
  _getObserver() {
    return this._observer ?? (this._observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        _ResizeObserverSingleton.entries.set(entry.target, entry);
        this._listeners.get(entry.target)?.(entry);
      }
    }));
  }
};
ResizeObserverSingleton.entries = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/internal/dom.js
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach(
    /** @param {Element} node */
    (node) => {
      result[node.slot || "default"] = true;
    }
  );
  return result;
}

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/shared/boolean_attributes.js
var _boolean_attributes = (
  /** @type {const} */
  [
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ]
);
var boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/internal/Component.js
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, Function[]>} Event listeners */
    $$l = {};
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    constructor($$componentCtor, $$slots, use_shadow_dom) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (use_shadow_dom) {
        this.attachShadow({ mode: "open" });
      }
    }
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot2 = function(name) {
          return () => {
            let node;
            const obj = {
              c: function create() {
                node = element("slot");
                if (name !== "default") {
                  attr(node, "name", name);
                }
              },
              /**
               * @param {HTMLElement} target
               * @param {HTMLElement} [anchor]
               */
              m: function mount(target, anchor) {
                insert(target, node, anchor);
              },
              d: function destroy(detaching) {
                if (detaching) {
                  detach(node);
                }
              }
            };
            return obj;
          };
        };
        var create_slot = create_slot2;
        await Promise.resolve();
        if (!this.$$cn) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            $$slots[name] = [create_slot2(name)];
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        this.$$c = new this.$$ctor({
          target: this.shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$scope: {
              ctx: []
            }
          }
        });
        const reflect_attributes = () => {
          this.$$r = true;
          for (const key in this.$$p_d) {
            this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
            if (this.$$p_d[key].reflect) {
              const attribute_value = get_custom_element_value(
                key,
                this.$$d[key],
                this.$$p_d,
                "toAttribute"
              );
              if (attribute_value == null) {
                this.removeAttribute(key);
              } else {
                this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
              }
            }
          }
          this.$$r = false;
        };
        this.$$c.$$.after_update.push(reflect_attributes);
        reflect_attributes();
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r)
        return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({ [attr2]: this.$$d[attr2] });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn) {
          this.$$c.$destroy();
          this.$$c = void 0;
        }
      });
    }
    $$g_p(attribute_name) {
      return Object.keys(this.$$p_d).find(
        (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
      ) || attribute_name;
    }
  };
}
function get_custom_element_value(prop, value, props_definition, transform) {
  const type = props_definition[prop]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}

// ../../node_modules/.pnpm/svelte@4.1.2/node_modules/svelte/src/runtime/store/index.js
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}

// ../runtime/src/core-utils.mts
var getFallbackProxy = () => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Proxy(Object.assign(() => "", {}), {
    get: (_target, key) => key === "length" ? 0 : getFallbackProxy()
  })
);

// ../parser/src/basic.mts
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

// ../runtime/src/core.mts
var applyFormatters = (formatters, formatterKeys, initialValue) => formatterKeys.reduce(
  (value, formatterKey) => (formatterKey.match(REGEX_SWITCH_CASE) ? ((cases) => cases[value] ?? cases["*"])(parseCases(formatterKey)) : formatters[formatterKey]?.(value)) ?? value,
  initialValue
);
var getPlural = (pluralRules, { z, o, t, f, m, r }, value) => {
  switch (z && value == 0 ? "zero" : pluralRules.select(value)) {
    case "zero":
      return z;
    case "one":
      return o;
    case "two":
      return t;
    case "few":
      return f ?? r;
    case "many":
      return m ?? r;
    default:
      return r;
  }
};
var REGEX_PLURAL_VALUE_INJECTION = /\?\?/g;
var applyArguments = (textParts, pluralRules, formatters, args) => textParts.map((part) => {
  if (typeof part === "string") {
    return part;
  }
  const { k: key = "0", f: formatterKeys = [] } = part;
  const value = args[key];
  if (isBasicPluralPart(part)) {
    return ((typeof value === "boolean" ? value ? part.o : part.r : getPlural(pluralRules, part, value)) || "").replace(REGEX_PLURAL_VALUE_INJECTION, value);
  }
  const formattedValue = formatterKeys.length ? applyFormatters(formatters, formatterKeys, value) : value;
  return ("" + (formattedValue ?? "")).trim();
}).join("");
var translate = (textParts, pluralRules, formatters, args) => {
  const firstArg = args[0];
  const isObject = firstArg && typeof firstArg === "object" && firstArg.constructor === Object;
  const transformedArgs = args.length === 1 && isObject ? firstArg : args;
  return applyArguments(textParts, pluralRules, formatters, transformedArgs);
};

// ../runtime/src/util.string.mts
var getPartsFromString = (cache, text) => cache[text] || (cache[text] = parseRawText(text));

// ../runtime/src/util.object.mts
var getTranslateInstance = (locale, formatters) => {
  const cache = {};
  const pluralRules = new Intl.PluralRules(locale);
  return (text, ...args) => translate(getPartsFromString(cache, text), pluralRules, formatters, args);
};
function i18nObject(locale, translations, formatters = {}) {
  return createProxy(translations, getTranslateInstance(locale, formatters));
}
var wrap = (proxyObject = {}, translateFn) => typeof proxyObject === "string" ? translateFn.bind(null, proxyObject) : Object.assign(
  Object.defineProperty(() => "", "name", { writable: true }),
  proxyObject
);
var createProxy = (proxyObject, translateFn) => new Proxy(wrap(proxyObject, translateFn), {
  get: (target, key) => {
    if (key === Symbol.iterator)
      return [][Symbol.iterator].bind(Object.values(target).map((entry) => wrap(entry, translateFn)));
    return createProxy(target[key], translateFn);
  }
});

// src/index.mts
var initI18nSvelte = (translations, formatters = {}) => {
  const _locale = writable();
  const _LL = writable(getFallbackProxy());
  const locale = readonly(_locale);
  const LL = new Proxy({}, {
    get: (_target, key) => key === "subscribe" ? _LL.subscribe : _LL[key]
  });
  const setLocale = (newLocale) => {
    _locale.set(newLocale);
    _LL.set(i18nObject(newLocale, translations[newLocale], formatters[newLocale]));
  };
  return {
    locale,
    LL,
    setLocale
  };
};
function readonly(store) {
  return {
    // @ts-ignore
    subscribe: store.subscribe.bind(store)
  };
}
