// src/index.ts
import { load, DEFAULT_SCHEMA } from "js-yaml";
import { createFilter } from "@rollup/pluginutils";
import toSource from "tosource";
var yamlExtension = /\.ya?ml$/;
var src_default = (options = { schema: DEFAULT_SCHEMA }) => ({
  name: "vite:transform-yaml",
  async transform(code, id) {
    if (yamlExtension.test(id)) {
      const filter = createFilter(options.include, options.exclude);
      if (!filter(id)) {
        return null;
      }
      const yamlData = load(code, {
        filename: id,
        schema: options.schema,
        onWarning: (warning) => (options == null ? void 0 : options.onWarning) && typeof options.onWarning === "function" ? options.onWarning(warning) : console.warn(warning.toString())
      });
      return {
        code: `const data = ${toSource(yamlData)};
export default data;`,
        map: { mappings: "" }
      };
    }
    return null;
  }
});
export {
  src_default as default
};
