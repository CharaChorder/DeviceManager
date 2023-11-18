const KEYMAP_CATEGORIES = await Promise.all(
  Object.values(/* @__PURE__ */ Object.assign({ "/src/lib/assets/keymaps/ascii.yml": () => import("./ascii.js"), "/src/lib/assets/keymaps/chara-chorder-one.yml": () => import("./chara-chorder-one.js"), "/src/lib/assets/keymaps/chara-chorder.yml": () => import("./chara-chorder.js"), "/src/lib/assets/keymaps/cp-1252.yml": () => import("./cp-1252.js"), "/src/lib/assets/keymaps/keyboard.yml": () => import("./keyboard.js"), "/src/lib/assets/keymaps/mouse.yml": () => import("./mouse.js"), "/src/lib/assets/keymaps/scancode.yml": () => import("./scancode.js") })).map(
    async (load) => load().then((it) => it.default)
  )
);
const KEYMAP_CODES = Object.fromEntries(
  KEYMAP_CATEGORIES.flatMap(
    (category) => Object.entries(category.actions).map(([code, action]) => [
      Number(code),
      { ...action, code: Number(code), category }
    ])
  )
);
new Map(
  KEYMAP_CATEGORIES.flatMap(
    (category) => Object.entries(category.actions).map(
      ([code, action]) => [action.id, { ...action, code: Number(code), category }]
    )
  ).filter(([id]) => id !== void 0)
);
export {
  KEYMAP_CODES as K
};
