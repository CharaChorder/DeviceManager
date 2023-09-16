# amaCC1ng

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/Theaninova/dotio/build.yml)
![GitHub](https://img.shields.io/github/license/Theaninova/dotio)
[![GitHub deployments](https://img.shields.io/github/deployments/Theaninova/dotio/Website?label=delployment)](https://dotio.theaninova.de/)

_This project is not affiliated or endorsed with neither the original [dot i/o](https://www.iq-eq.io/) site, nor [CharaChorder](https://www.charachorder.com/)_

Get the latest desktop release [here](https://github.com/Theaninova/dotio/releases).

I aim to create a new site that offers an easier, visually pleasing
and more complete way to configure and learn CharaChorder devices.

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

## Releases

Change the version in

- [package.json](package.json)
- [tauri.conf.json](src-tauri/tauri.conf.json)
- [Cargo.toml](src-tauri/Cargo.toml)
