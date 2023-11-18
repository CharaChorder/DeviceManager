

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/config/chords/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.ad7b0e64.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/each.94f093eb.js","_app/immutable/chunks/keymap-codes.fc236303.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/ActionSelector.2ddb6b76.js","_app/immutable/chunks/i18n-svelte.4af892db.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/title.f08fecde.js","_app/immutable/chunks/undo-redo.825f6805.js","_app/immutable/chunks/connection.5cd615cd.js","_app/immutable/chunks/index.085a7975.js"];
export const stylesheets = ["_app/immutable/assets/4.5269acd7.css","_app/immutable/assets/ActionSelector.a7934de1.css","_app/immutable/assets/title.7b34b164.css"];
export const fonts = [];
