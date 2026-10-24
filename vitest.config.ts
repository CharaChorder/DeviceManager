import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "@vitest/browser-playwright";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { fileURLToPath } from "url";
import { layoutPlugin } from "./vite-plugin-layout";
import { lezerGrammarPlugin } from "./vite-plugin-lezer";

const aliases = {
  $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
  $i18n: fileURLToPath(new URL("./src/i18n", import.meta.url)),
  "$app/environment": fileURLToPath(
    new URL("./test/stubs/app-environment.ts", import.meta.url),
  ),
  // PWA virtual modules only exist in the Vite build; tests get the stub.
  "virtual:pwa-register/svelte": fileURLToPath(
    new URL("./test/stubs/pwa-register.ts", import.meta.url),
  ),
  "virtual:pwa-register": fileURLToPath(
    new URL("./test/stubs/pwa-register.ts", import.meta.url),
  ),
  "virtual:pwa-info": fileURLToPath(
    new URL("./test/stubs/pwa-info.ts", import.meta.url),
  ),
};

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      dev: !process.env.VITEST,
      // Test-only override: the project's svelte.config.js forces runes mode,
      // which breaks the legacy-mode scaffold components inside
      // @testing-library. Auto-detect lets node_modules compile in legacy
      // mode while all app code (runes throughout) compiles identically.
      compilerOptions: process.env.VITEST ? { runes: undefined } : {},
    }),
    ViteYaml({ exclude: /\.layout\.yml$/ }),
    layoutPlugin(),
    lezerGrammarPlugin(),
  ],
  resolve: { alias: aliases },
  // The browser lane serves the app's static assets (the CCOS worker boots
  // `new Worker("/ccos-worker.js")` in the page, like in production).
  publicDir: "static",
  // Pre-bundle deps that join the module graph mid-run (flexsearch enters
  // on the first ActionList mount); otherwise vite re-optimizes and
  // reloads the test page mid-suite. `entries` makes the scanner walk the
  // browser-lane specs up front so cold runs start with a complete graph.
  optimizeDeps: {
    include: [
      "flexsearch",
      "semver",
      "@codemirror/autocomplete",
      "@codemirror/language",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/common",
      "@lezer/lr",
    ],
    entries: [
      "src/**/*.svelte.spec.ts",
      "src/**/*.emulator.spec.ts",
      "src/lib/**/*.ts",
      "src/routes/**/*.ts",
    ],
  },
  test: {
    globals: true,
    expect: { requireAssertions: true },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/routes/**"],
      exclude: [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.svelte",
        "src/lib/assets/**",
        "src/i18n/**",
      ],
    },
    // Emulator lane is opt-in (`pnpm test:emulator`): it boots the real CCOS
    // firmware as WASM fetched from the firmware meta API, so it needs network
    // and the browser project. It never gates the deterministic unit/UI suite.
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["test/stubs/unit-setup.ts"],
          include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
          exclude: [
            "src/**/*.svelte.spec.ts",
            "src/**/*.emulator.spec.ts",
            "**/node_modules/**",
          ],
        },
      },
      {
        extends: true,
        // The browser lane resolves bare `svelte*` specifiers through vite's
        // optimizer, which maps them onto the package main entry (`svelte/store`
        // breaks there). Inline them so they resolve like in node.
        server: {
          deps: {
            web: {
              inline: [/svelte/, /vitest-browser-svelte/],
            },
          },
        },
        test: {
          name: "ui",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              {
                browser: (process.env.BROWSER ?? "chromium") as
                  | "chromium"
                  | "firefox",
                headless: true,
              },
            ],
            viewport: { width: 1280, height: 900 },
          },
          include: ["src/**/*.svelte.spec.ts"],
          setupFiles: ["vitest-browser-svelte"],
          // Cap concurrent pages: the combined `pnpm test` run executes jsdom
          // workers and browser pages at once, and fully parallel pages cause
          // module-load starvation in the shared chromium browser.
          fileParallelism: 4,
        },
      },
      {
        extends: true,
        server: {
          deps: {
            web: {
              inline: [/svelte/, /vitest-browser-svelte/],
            },
          },
        },
        test: {
          name: "emulator",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }],
            viewport: { width: 1280, height: 900 },
          },
          include: ["src/**/*.emulator.spec.ts"],
          // one file at a time: every file boots its own firmware instance,
          // parallel boots saturate the single worker thread of the page
          fileParallelism: false,
          teardownTimeout: 30000,
        },
      },
    ],
  },
});
