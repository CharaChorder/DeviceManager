import adapter from "@sveltejs/adapter-static";
import autoprefixer from "autoprefixer";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const { version } = JSON.parse(
  await readFile(
    fileURLToPath(new URL("package.json", import.meta.url)),
    "utf8",
  ),
);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess({ postcss: { plugins: autoprefixer() } })],
  compilerOptions: {
    runes: true,
  },
  kit: {
    adapter: adapter({ fallback: "404.html" }),
    alias: {
      $i18n: "./src/i18n",
    },
    version: {
      name: version,
    },
  },
};

export default config;
