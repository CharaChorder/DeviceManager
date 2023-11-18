

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/plugin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.2eea82ec.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/keymap-codes.fc236303.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/i18n-svelte.4af892db.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/connection.5cd615cd.js"];
export const stylesheets = ["_app/immutable/assets/7.6c9a3658.css"];
export const fonts = [];
