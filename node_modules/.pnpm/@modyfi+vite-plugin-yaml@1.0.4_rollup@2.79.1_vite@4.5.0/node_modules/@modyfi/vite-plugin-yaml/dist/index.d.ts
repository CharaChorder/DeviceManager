import { Schema, YAMLException } from 'js-yaml';
import { Plugin } from 'vite';
import { FilterPattern } from '@rollup/pluginutils';

type PluginOptions = {
    /**
     * A minimatch pattern, or array of patterns, which specifies the files in the build the plugin
     * should operate on.
     *
     * By default all files are targeted.
     */
    include?: FilterPattern;
    /**
     * A minimatch pattern, or array of patterns, which specifies the files in the build the plugin
     * should ignore.
     *
     * By default no files are ignored.
     */
    exclude?: FilterPattern;
    /**
     * Schema used to parse yaml files.
     *
     * @see https://github.com/nodeca/js-yaml/blob/49baadd52af887d2991e2c39a6639baa56d6c71b/README.md#load-string---options-
     */
    schema?: Schema;
    /**
     * A function that will be called for error reporting.
     *
     * Defaults to `console.warn()`.
     */
    onWarning?: (warning: YAMLException) => void;
};
/**
 * Transform YAML files to JS objects.
 */
declare const _default: (options?: PluginOptions) => Plugin;

export { PluginOptions, _default as default };
