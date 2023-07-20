{
  description = "A Nix-flake-based development environment for OpenStApps";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  outputs = { self, nixpkgs }:
    let
      overlays = [
        (final: prev: rec {
          nodejs = prev.nodejs-18_x;
          chrome = prev.google-chrome;
          firefox = prev.firefox;
          webkit = prev.epiphany; # Safari-ish browser
        })
      ];
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs {
	  inherit overlays system;
	  config.allowUnfree = true;
	};
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }:
      let
        python = (pkgs.python311.withPackages(ps: with ps; [ brotli fonttools ] ++ (with fonttools.optional-dependencies; [ woff ])));
      in
      {
        default = pkgs.mkShell {
          packages = with pkgs; [
            node2nix
            nodejs
            python
            firefox
            chrome
            webkit
          ];
        };
      });
    };
}
