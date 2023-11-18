export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".htaccess","favicon.png","icon.svg","robots.txt","sandbox.html"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".txt":"text/plain",".html":"text/html"},
	_: {
		client: {"start":"_app/immutable/entry/start.1198e80a.js","app":"_app/immutable/entry/app.256ce429.js","imports":["_app/immutable/entry/start.1198e80a.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/singletons.de2fb98c.js","_app/immutable/chunks/index.c76aaf45.js","_app/immutable/chunks/control.f5b05b5f.js","_app/immutable/entry/app.256ce429.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.f5cfe514.js","_app/immutable/chunks/index.c2fc59c9.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
