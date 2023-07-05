import {sveltekit} from "@sveltejs/kit/vite"
import {defineConfig} from "vite"
import {SvelteKitPWA} from "@vite-pwa/sveltekit"

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      kit: {
        adapterFallback: "/200.html",
        trailingSlash: "never",
      },
      base: "/",
      workbox: {
        modifyURLPrefix: {
          "": "/",
          "./": "/",
        },
      },
    }),
  ],
})
