import {readFile, writeFile} from "fs/promises"
import {fileURLToPath} from "url"
import * as path from "path"
import {format} from "prettier"

const projectDir = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..")

const {version} = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"))

const tauriConfigPath = path.join(projectDir, "src-tauri", "tauri.conf.json")

const tauriConfig = JSON.parse(await readFile(tauriConfigPath, "utf8"))
tauriConfig.package.version = version
await writeFile(tauriConfigPath, await format(JSON.stringify(tauriConfig), {parser: "json"}))

const cargoTomlPath = path.join(projectDir, "src-tauri", "Cargo.toml")

const cargoToml = await readFile(cargoTomlPath, "utf8")
const modified = cargoToml.replace(/^\s*version\s*=\s*"\d\.\d.\d"\s*$/m, `version = "${version}"`)
await writeFile(cargoTomlPath, modified)
