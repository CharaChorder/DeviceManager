{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      rust-overlay,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [
          (import rust-overlay)
          (final: prev: {
            nodejs = prev.nodejs_22;
            corepack = prev.corepack_22;
          })
        ];
        pkgs = import nixpkgs { inherit system overlays; };
        rust-bin = pkgs.rust-bin.stable.latest.default.override {
          extensions = [
            "rust-src"
            "rust-std"
            "clippy"
            "rust-analyzer"
          ];
        };
        fontMin = pkgs.python311.withPackages (
          ps:
          with ps;
          [
            brotli
            fonttools
          ]
          ++ (with fonttools.optional-dependencies; [ woff ])
        );
        tauriPkgs = nixpkgs.legacyPackages.${system};
        libraries = with tauriPkgs; [
          webkitgtk_4_1
          gtk3
          cairo
          gdk-pixbuf
          glib
          dbus
          openssl
          librsvg
        ];
        packages =
          (with pkgs; [
            nodejs
            pnpm
            rust-bin
            fontMin
          ])
          ++ (with tauriPkgs; [
            curl
            wget
            pkg-config
            dbus
            openssl
            glib
            gtk3
            libsoup_3
            webkitgtk_4_1
            librsvg
            # serial plugin
            udev
          ]);
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = packages;
          # Playwright browsers for the Vitest browser projects (UI + emulator specs).
          # npm `playwright` is pinned to the driver version in flake.lock's nixpkgs
          # (`nix eval nixpkgs#playwright-driver.version`), so the npm package and the
          # Nix browsers always speak the same browser build numbers.
          nativeBuildInputs = [pkgs.playwright-driver.browsers];
          shellHook = ''
            #export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          '';
        };
      }
    );
}
