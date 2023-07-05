import adapter from "@sveltejs/adapter-static"
import preprocess from "svelte-preprocess"

const dev = process.argv.includes("dev")

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess()],
  kit: {
    paths: {
      base: dev ? "" : "/dotio",
    },
    adapter: adapter(),
  },
}

export default config
