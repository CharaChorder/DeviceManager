module.exports = {
  ...require("@theaninova/prettier-config"),
  plugins: ["prettier-plugin-svelte"],
  pluginSearchDirs: ["."],
  overrides: [{files: "*.svelte", options: {parser: "svelte"}}],
}
