

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/config/settings/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.d046435b.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/connection.5cd615cd.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/undo-redo.825f6805.js","_app/immutable/chunks/keymap-codes.fc236303.js"];
export const stylesheets = ["_app/immutable/assets/6.dae5582f.css"];
export const fonts = [];
