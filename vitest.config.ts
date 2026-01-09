import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import { lezerGrammarPlugin } from "./vite-plugin-lezer";
import { layoutPlugin } from "./vite-plugin-layout";

export default defineConfig({
  plugins: [layoutPlugin(), sveltekit(), lezerGrammarPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
