import * as universal from '../entries/pages/_layout.ts.js';
import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.460d8064.js","_app/immutable/chunks/share.0727875d.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/connection.5cd615cd.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/index.085a7975.js","_app/immutable/chunks/title.f08fecde.js","_app/immutable/chunks/i18n-svelte.4af892db.js","_app/immutable/chunks/undo-redo.825f6805.js","_app/immutable/chunks/keymap-codes.fc236303.js","_app/immutable/chunks/stores.a124d468.js","_app/immutable/chunks/singletons.de2fb98c.js"];
export const stylesheets = ["_app/immutable/assets/0.6d65d110.css","_app/immutable/assets/title.7b34b164.css","_app/immutable/assets/PwaStatus.ae828e08.css"];
export const fonts = ["_app/immutable/assets/noto-sans-mono-latin-ext-wght-normal.dd6dde29.woff2","_app/immutable/assets/noto-sans-mono-latin-wght-normal.7cde1fc6.woff2","_app/immutable/assets/icons.min.c1d8edb4.woff2"];
