import type {CharaLayoutFile} from "$lib/share/chara-file"

/**
 * Converts a legacy CSV-based layout to the modern JSON-based format
 */
export function csvLayoutToJson(csv: string, device: CharaLayoutFile["device"] = "one"): CharaLayoutFile {
  const layout: CharaLayoutFile = {
    charaVersion: 1,
    type: "layout",
    device,
    layout: [[], [], []],
  }

  for (const layer of csv.trim().split("\n")) {
    const [layerId, key, action] = layer.substring(1).split(",").map(Number)

    layout.layout[Number(layerId) - 1][Number(key)] = Number(action)
  }

  return layout
}

export function isCsvLayout(csv: string): boolean {
  return /^(A[123],\d+,\d+\n?)+$/.test(csv)
}
