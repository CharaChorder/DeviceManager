{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rust-bin = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-std" "clippy" "rust-analyzer" ];
        };
        fontMin = (pkgs.python311.withPackages(ps: with ps; [ brotli fonttools ] ++ (with fonttools.optional-dependencies; [ woff ])));
        tauriPkgs = nixpkgs.legacyPackages.${system};
        libraries = with tauriPkgs; [
          webkitgtk
          gtk3
          cairo
          gdk-pixbuf
          glib
          dbus
          openssl_3
          librsvg
        ];
        packages = (with pkgs; [
          nodejs_18
          rust-bin
          fontMin
        ]) ++ (with tauriPkgs; [
          curl
          wget
          pkg-config
          dbus
          openssl_3
          glib
          gtk3
          libsoup
          webkitgtk
          librsvg
	  # serial plugin
	  udev
        ]);
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = packages;
          shellHook = ''
            export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
          '';
        };
      });
}
