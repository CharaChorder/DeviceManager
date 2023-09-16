# Contributing

## UX Principles

- **Opinionated.** There should never be two ways to do the same thing.
- **Intuitive.** If a feature needs a description to explain it,
  the feature has failed.
- **Simple.** No useless buttons that always need to be pressed.

## UI Design

The UI design is based on Material 3.

## Development Setup

### Nix

[Enable flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes), then start the development shell using

```shell
nix develop
```

You may need to run through some additional setup to get Rust running inside IntelliJ.

### Other platforms

- NodeJS >=18.16
- Python >=3.10
- Rust Stable (For Tauri Development)

I know, python in JS projects is extremely annoying, unfortunately,
it seems to be the only platform that offers a functional
way to subset variable woff2 fonts with ligatures.

In other words, either have python as a development dependency or
serve a 3.5MB icons font of which 99.5% is completely unused.
