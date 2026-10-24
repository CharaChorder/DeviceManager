# AGENTS.md

CharaChorder Device Manager ("dotio"): SvelteKit 5 (runes, `@sveltejs/adapter-static`) SPA + PWA that also ships as a Tauri 1 desktop app. One codebase, two build targets; all app logic runs in the browser (no SvelteKit server code — routes are prerendered, fallback `404.html`).

## Toolchain

- NixOS/flake dev shell: `nix develop` (direnv `use flake` is set up). It provides Node 22, pnpm, Rust, and the Python fonttools env.
- Requires Node >= 22.14 and pnpm >= 10.7 (package.json engines). Install deps with `pnpm install`.

## Commands

- `pnpm dev` — Vite dev server **plus** the typesafe-i18n watcher in parallel. Don't run bare `vite dev`: `src/i18n` is generated code (base locale `en`); it must be generated/watched.
- `pnpm build` — generates i18n once (`typesafe-i18n --no-watch`), then `vite build`.
- `pnpm test` — `vitest run --coverage`. Tests are colocated as `*.spec.ts` next to their source in `src/lib` (e.g. `src/lib/versioning.spec.ts`).
  - Single test file: `pnpm vitest run src/lib/serial/chord.spec.ts`; single test: `pnpm vitest run -t "name"`.
  - Tests run in jsdom; `$app/environment` is aliased to `test/stubs/app-environment.ts`, so tests can't rely on the real SvelteKit runtime.
- `pnpm check` — `svelte-kit sync && svelte-check`. Run after structural/import changes; `.svelte-kit` types must exist.
- `pnpm lint` / `pnpm format` — Prettier only (svelte + css-order plugins). Stylelint config exists but has no script and is not run in CI.

## Build gotchas

- `src/lib/assets/icons.min.woff2` is gitignored and generated: run `pnpm minify-icons` before `pnpm build` (CI does `minify-icons` → `build`). Needs Python fonttools/brotli (`pip install -r requirements.txt`); the flake provides it as `fontMin`.
- Custom Vite plugins transform custom file types in-place — no on-disk codegen to look for:
  - `*.grammar` (Lezer, e.g. `src/lib/chord-editor/chords.grammar`) → generated parser via `vite-plugin-lezer.ts`.
  - `*.layout.yml` (`src/lib/assets/layouts/`) → compiled `CompiledLayout` TS via `vite-plugin-layout.ts`.
  - Regular YAML is importable via `vite-plugin-yaml`, except `*.layout.yml` (handled by the layout plugin).
- Target split is keyed on the `TAURI_FAMILY` env var in `vite.config.ts`: Tauri builds exclude the PWA plugin; PWA builds target chrome114/safari16 (Web Serial/USB APIs).

## Tauri

- `pnpm dev:tauri` (`tauri dev`, which boots the web dev server via `beforeDevCommand`); `pnpm build:tauri` for packaging. Needs the Rust toolchain + webkitgtk/gtk3 (in the flake).
- Serial in Tauri goes through the Rust extension (`src/lib/serial/tauri-serial.ts`), not `navigator.serial`; web path uses `navigator.serial`/`navigator.usb` directly (`src/lib/serial/connection.ts`).

## Versioning & release

- Don't edit versions in three files by hand: `pnpm version <x>` (the `version` script, `src/tools/version.js`) syncs `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml` from `package.json` and `git add`s them.
- Tags drive CI: `v*` → website build + rsync deploy (`.github/workflows/build.yml`); `desktop-app-v*` → Tauri desktop release on all platforms (`.github/workflows/publish.yml`).

## Structure

- Routes live in `src/routes/(app)/` (config, ccos, editor, recipes, terminal, sandbox). Device/connection logic is in `src/lib/serial/`; chord editing in `src/lib/chord-editor/`; backup/compat (legacy format migrations) in `src/lib/backup/`.
- UX rules from CONTRIBUTING.md: opinionated (never two ways to do one thing), self-explanatory UI, no useless buttons. UI is Material 3.
