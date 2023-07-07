/*
 * Copyright (C) 2022 StApps
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */
// @ts-expect-error missing types
import {openSync} from "fontkit"
import {exec} from "child_process"
import config from "../../icons.config.js"
import {statSync, existsSync} from "fs"
import {readFile} from "fs/promises"
import {glob} from "glob"

async function run(command: string[] | string): Promise<string> {
  const fullCommand = Array.isArray(command) ? command.join(" ") : command
  console.log(`>> ${fullCommand}`)

  return new Promise((resolve, reject) => {
    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

const yamlFiles = await glob("src/lib/assets/keymaps/*.yml")
const yamlIcons = await Promise.all(
  yamlFiles.map(it =>
    readFile(it, "utf8").then(file => [...file.matchAll(/^\s*icon:\s+(\w+)/gm)].map(match => match[1])),
  ),
).then(it => it.flat())

const icons = new Set([...config.icons, ...yamlIcons])

console.log("Icons used:", [...icons.values()].sort())
const font = openSync(config.inputPath)

const glyphs = ["5f-7a", "30-39"]
for (const icon of icons) {
  const iconGlyphs: Array<{id: string}> = font.layout(icon).glyphs
  if (iconGlyphs.length === 0) {
    console.error(`${icon} not found in font. Typo?`)
    process.exit(-1)
  }

  const codePoints = iconGlyphs
    .flatMap(it => font.stringsForGlyph(it.id))
    .flatMap(it => [...it])
    .map(it => it.codePointAt(0).toString(16))

  if (codePoints.length === 0) {
    const codePoint = config.codePoints[icon]
    if (config.codePoints?.[icon]) {
      glyphs.push(config.codePoints[icon])
    } else {
      console.log()
      console.error(`${icon} code point could not be determined. Add it to config.codePoints.`)
      process.exit(-1)
    }
  }

  glyphs.push(...codePoints)
}
glyphs.sort()

const pythonPath = "./venv/bin/python"
if (!existsSync(pythonPath)) {
  throw new Error(`Expected a python virtual environment at ${pythonPath}`)
}
console.log(await run(`${pythonPath} --version`))
console.log(
  await run([
    pythonPath,
    "-m fontTools.subset",
    `"${config.inputPath}"`,
    `--unicodes=${glyphs.join(",")}`,
    "--no-layout-closure",
    `--output-file="${config.outputPath}"`,
    "--flavor=woff2",
  ]),
)

console.log(`${glyphs.length} Used Icons Total`)
console.log(`Minified font saved to ${config.outputPath}`)
const result = statSync(config.outputPath).size
const before = statSync(config.inputPath).size

console.log(
  `${toByteUnit(before)} > ${toByteUnit(result)} (${(((before - result) / before) * 100).toFixed(
    2,
  )}% Reduction)`,
)

/**
 * Bytes to respective units
 */
function toByteUnit(value: number) {
  if (value < 1024) {
    return `${value}B`
  } else if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(2)}KB`
  } else {
    return `${(value / 1024 / 1024).toFixed(2)}MB`
  }
}
