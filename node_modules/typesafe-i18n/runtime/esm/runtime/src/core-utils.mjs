// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFallbackProxy = () => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
new Proxy(Object.assign(() => '', {}), {
    get: (_target, key) => (key === 'length' ? 0 : getFallbackProxy()),
});
