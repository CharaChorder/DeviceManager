# CharaChorder Device Manager

The official device manager and configuration tool for CharaChorder devices.

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/CharaChorder/DeviceManager/build.yml)
![GitHub](https://img.shields.io/github/license/CharaChorder/DeviceManager)
[![GitHub deployments](https://img.shields.io/github/deployments/CharaChorder/DeviceManager/Website?label=delployment)](https://manager.charachorder.com/)

Get the latest desktop release [here](https://github.com/CharaChorder/DeviceManager/releases).

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
