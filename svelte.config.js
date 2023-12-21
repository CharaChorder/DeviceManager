import adapter from "@sveltejs/adapter-static"
import preprocess from "svelte-preprocess"
import autoprefixer from "autoprefixer"
import {readFile} from "fs/promises"
import {fileURLToPath} from "url"

const {version} = JSON.parse(await readFile(fileURLToPath(new URL("package.json", import.meta.url)), "utf8"))

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess({postcss: {plugins: autoprefixer()}})],
  kit: {
    adapter: adapter({fallback: "404.html"}),
    version: {
      name: version,
    },
  },
}

export default config
