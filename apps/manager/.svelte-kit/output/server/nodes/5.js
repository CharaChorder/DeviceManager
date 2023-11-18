

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/config/layout/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.10eca9fe.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/share.0727875d.js","_app/immutable/chunks/connection.5cd615cd.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/title.f08fecde.js","_app/immutable/chunks/ActionSelector.2ddb6b76.js","_app/immutable/chunks/keymap-codes.fc236303.js","_app/immutable/chunks/i18n-svelte.4af892db.js","_app/immutable/chunks/undo-redo.825f6805.js"];
export const stylesheets = ["_app/immutable/assets/5.9ee98ee0.css","_app/immutable/assets/title.7b34b164.css","_app/immutable/assets/ActionSelector.a7934de1.css"];
export const fonts = [];
