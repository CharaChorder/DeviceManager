/**
 * @type {import('@inlang/core/config').DefineConfig}
 */
export async function defineConfig(env) {
  const {default: pluginYaml} = await env.$import(
    "https://cdn.jsdelivr.net/gh/felixhaeberle/inlang-plugin-yaml@2.0.1/dist/index.js",
  )
  const {default: sdkPlugin} = await env.$import(
    "https://cdn.jsdelivr.net/npm/@inlang/sdk-js-plugin@0.10.1/dist/index.js",
  )

  return {
    referenceLanguage: "en",
    plugins: [
      sdkPlugin({
        languageNegotiation: {
          strategies: [{type: "localStorage"}],
        },
      }),
      pluginYaml({
        pathPattern: "./languages/{language}.yml",
      }),
    ],
  }
}
