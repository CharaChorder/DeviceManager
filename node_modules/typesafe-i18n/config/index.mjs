// ../shared/src/file.utils.mts
var getFiles = async (fs, path, depth = 0) => {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const files = entries.filter((file) => !file.isDirectory()).map(({ name }) => ({ name: name.toString(), folder: "" }));
  const folders = entries.filter((folder) => folder.isDirectory());
  if (depth) {
    for (const folder of folders)
      files.push(
        ...(await getFiles(fs, `${path}/${folder.name}/`, depth - 1)).map((file) => ({
          name: file.name.toString(),
          folder: folder.name.toString()
        }))
      );
  }
  return files;
};
var getAllLocales = async (fs, path, outputFormat) => {
  const fileEnding = outputFormat === "JavaScript" ? ".js" : ".ts";
  const files = await getFiles(fs, path, 1);
  return files.filter(({ folder, name }) => folder && name === `index${fileEnding}`).map(({ folder }) => folder);
};

// src/core.mts
var applyDefaultValues = async (config) => ({
  baseLocale: "en",
  tempPath: "./node_modules/typesafe-i18n/temp-output/",
  outputPath: "./src/i18n/",
  outputFormat: "TypeScript",
  typesFileName: "i18n-types",
  utilFileName: "i18n-util",
  formattersTemplateFileName: "formatters",
  typesTemplateFileName: "custom-types",
  esmImports: false,
  adapter: void 0,
  generateOnlyTypes: false,
  banner: "/* eslint-disable */",
  runAfterGenerator: void 0,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...config
});
var readConfigFromDisk = async (fs) => {
  const content = await fs.readFile(".typesafe-i18n.json").catch(() => "{}");
  return JSON.parse(content.toString());
};
var getConfig = async (fs) => {
  const config = await readConfigFromDisk(fs);
  return applyDefaultValues(config);
};
var getLocaleInformation = async (fs) => {
  const config = await getConfig(fs);
  return {
    base: config.baseLocale,
    locales: await getAllLocales(fs, config.outputPath, config.outputFormat)
  };
};
export {
  getConfig,
  getLocaleInformation
};
