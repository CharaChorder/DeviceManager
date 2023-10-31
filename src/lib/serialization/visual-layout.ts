export interface VisualLayout {
  name: string
  row: VisualLayoutRow[]
}

export interface VisualLayoutRow {
  col: VisualLayoutKey[]
}

export interface VisualLayoutKey {
  id: number
  size?: [number, number]
}

export interface CompiledLayout {
  name: string
  size: [number, number]
  keys: CompiledLayoutKey[]
}

export interface CompiledLayoutKey {
  id: number
  type: "key" | "dpad"
  size: [number, number]
  pos: [number, number]
}

export function compileLayout(layout: VisualLayout): CompiledLayout {
  const compiled: CompiledLayout = {
    name: layout.name,
    size: [0, 0],
    keys: [],
  }

  let y = 0
  for (const {col} of layout.row) {
    let x = 0
    let maxHeight = 0
    for (const {id, size} of col) {
      const [width, height] = size ?? [1, 1]

      compiled.keys.push({
        id,
        type: "key",
        size: [width, height],
        pos: [x, y],
      })

      x += width
      maxHeight = Math.max(maxHeight, height)
    }
    y += maxHeight
    compiled.size[0] = Math.max(compiled.size[0], x)
  }
  compiled.size[1] = y

  return compiled
}
