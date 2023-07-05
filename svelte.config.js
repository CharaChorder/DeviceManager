import adapter from "@sveltejs/adapter-static"
import preprocess from "svelte-preprocess"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess()],
  kit: {
    inlineStyleThreshold: 8192,
    paths: {
      relative: false,
    },
    adapter: adapter({
      fallback: "200.html",
    }),
  },
}

export default config
