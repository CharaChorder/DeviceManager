export interface IconsConfig {
  codePoints: Record<string, string>
  inputPath: string
  outputPath: string
  icons: string[]
}

const config: IconsConfig = {
  inputPath:
    "node_modules/@fontsource-variable/material-symbols-rounded/files/material-symbols-rounded-latin-full-normal.woff2",
  outputPath: "src/lib/assets/icons.min.woff2",
  icons: [
    "piano",
    "keyboard",
    "settings",
    "music_note",
    "avg_pace",
    "lyrics",
    "speed",
    "cognition",
    "update",
    "offline_pin",
    "warning",
    "cable",
    "person",
    "sync",
    "restart_alt",
    "usb",
    "rule_settings",
    "123",
    "abc",
    "function",
  ],
  codePoints: {
    speed: "e9e4",
    arrow_split: "e985",
    arrow_circle_down: "f181",
    arrow_circle_up: "f182",
    counter_1: "f784",
    counter_2: "f783",
    counter_3: "f782",
  },
}

export default config
