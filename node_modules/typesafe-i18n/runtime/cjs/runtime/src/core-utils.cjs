"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFallbackProxy = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFallbackProxy = () => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
new Proxy(Object.assign(() => '', {}), {
    get: (_target, key) => (key === 'length' ? 0 : (0, exports.getFallbackProxy)()),
});
exports.getFallbackProxy = getFallbackProxy;
