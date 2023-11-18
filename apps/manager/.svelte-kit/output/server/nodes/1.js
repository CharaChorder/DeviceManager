

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.266a9c71.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js","_app/immutable/chunks/stores.a124d468.js","_app/immutable/chunks/singletons.de2fb98c.js","_app/immutable/chunks/index.c76aaf45.js"];
export const stylesheets = [];
export const fonts = [];
