# dot i/o V2

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/Theaninova/dotio/build.yml)
![GitHub](https://img.shields.io/github/license/Theaninova/dotio)
[![GitHub deployments](https://img.shields.io/github/deployments/Theaninova/dotio/Website?label=delployment)](https://dotio.theaninova.de/)

_This project is not affiliated or endorsed with neither the original [dot i/o](https://www.iq-eq.io/) site, nor [CharaChorder](https://www.charachorder.com/)_

I aim to create a new site that offers an easier, visually pleasing
and more complete way to configure and learn CharaChorder devices.

## Development

### Nix

[Enable flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes), then start the development shell using

```shell
nix develop
```

You may need to run through some additional setup to get Rust running inside IntelliJ.

### Other platforms

- NodeJS >=18.16
- Python >=3.10

I know, python in JS projects is extremely annoying, unfortunately,
it seems to be the only platform that offers a functional
way to subset variable woff2 fonts with ligatures.

In other words, either have python as a development dependency or
serve a 3.5MB icons font of which 99.5% is completely unused.

## Deployment

### SSH Setup

To generate a valid ssh key that can be used by the deployment workflow,
use the following command:

```shell
ssh-keygen -m PEM -b 4096 -t rsa -f dotio
```

Omitting `-m PEM -b 4096` will result in a key that rsync cannot read!

To double-check, make sure your private key starts with

```
-----BEGIN RSA PRIVATE KEY-----
```

After that, add the `SSH_SERVER`, `SSH_PORT`, `SSH_PRIVATE_KEY` and `SSH_USER`
environment secrets to your environment in GitHub.
