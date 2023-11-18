"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _jsyaml = require('js-yaml');
var _pluginutils = require('@rollup/pluginutils');
var _tosource = require('tosource'); var _tosource2 = _interopRequireDefault(_tosource);
var yamlExtension = /\.ya?ml$/;
var src_default = (options = { schema: _jsyaml.DEFAULT_SCHEMA }) => ({
  name: "vite:transform-yaml",
  async transform(code, id) {
    if (yamlExtension.test(id)) {
      const filter = _pluginutils.createFilter.call(void 0, options.include, options.exclude);
      if (!filter(id)) {
        return null;
      }
      const yamlData = _jsyaml.load.call(void 0, code, {
        filename: id,
        schema: options.schema,
        onWarning: (warning) => (options == null ? void 0 : options.onWarning) && typeof options.onWarning === "function" ? options.onWarning(warning) : console.warn(warning.toString())
      });
      return {
        code: `const data = ${_tosource2.default.call(void 0, yamlData)};
export default data;`,
        map: { mappings: "" }
      };
    }
    return null;
  }
});


exports.default = src_default;
