// noinspection ES6PreferShortImport
import { themeColor } from "./src/lib/style/theme";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { lezerGrammarPlugin } from "./vite-plugin-lezer";
import { layoutPlugin } from "./vite-plugin-layout";

const isTauri = "TAURI_FAMILY" in process.env;
console.info(isTauri ? "Building for Tauri" : "Building for PWA");
const { homepage, bugs, repository } = JSON.parse(
  await readFile(
    fileURLToPath(new URL("package.json", import.meta.url)),
    "utf8",
  ),
);

process.env["VITE_HOMEPAGE_URL"] = repository.url.replace(/\.git$/, "");
process.env["VITE_DOCS_URL"] = homepage;
process.env["VITE_BUGS_URL"] = bugs.url;
process.env["VITE_LEARN_URL"] = "https://www.iq-eq.io/";
process.env["VITE_LATEST_FIRMWARE"] = "1.1.4";
process.env["VITE_STORE_URL"] = "https://www.charachorder.com/";
process.env["VITE_MATRIX_URL"] = "https://charachorder.io/";
process.env["VITE_FIRMWARE_URL"] = "https://charachorder.io/firmware";

export default defineConfig({
  build: {
    // we rely on the serial api, so just chrome is fine
    target: ["chrome114", "safari16"],
    sourcemap: true,
    rollupOptions: {
      external: isTauri ? [/virtual:pwa.*/] : [],
    },
  },
  define: {
    global: "window",
  },
  envPrefix: ["TAURI_", "VITE_"],
  plugins: [
    ViteYaml({ exclude: /\.layout\.yml$/ }),
    layoutPlugin(),
    sveltekit(),
    lezerGrammarPlugin(),
    ...(isTauri
      ? []
      : [
          SvelteKitPWA({
            kit: {
              trailingSlash: "always",
              adapterFallback: "404.html",
            },
            scope: "/",
            base: "/",
            includeAssets: ["favicon.png"],
            workbox: {
              // https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#globpatterns
              globPatterns: [
                "client/**/*.{js,css,ico,woff2,csv,png,webp,svg,webmanifest}",
                "prerendered/**/*.html",
              ],
              globIgnores: ["prerendered/pages/ccos/**/*"],
              ignoreURLParametersMatching: [/^import|redirectUrl|loginToken$/],
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
            manifest: {
              name: "CharaChorder Device Manager",
              id: "charchorder-device-manager",
              theme_color: themeColor,
              icons: [
                {
                  src: "icon.svg",
                  sizes: "144x144",
                  type: "image/svg+xml",
                },
              ],
            },
          }),
        ]),
  ],
});
