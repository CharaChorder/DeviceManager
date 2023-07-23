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
    "edit",
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
    "usb_off",
    "rule_settings",
    "123",
    "abc",
    "function",
    "cloud_done",
    "backup",
    "cloud_download",
    "cloud_off",
    "share",
    "ios_share",
    "close",
    "arrow_back",
    "arrow_back_ios_new",
    "save",
    "settings_backup_restore",
    "sort",
    "filter_list",
    "settings_power",
    "link",
    "link_off",
    "chevron_right",
    "check_circle",
    "error",
    "auto_delete",
    "format_paint",
    "dark_mode",
    "light_mode",
    "palette",
  ],
  codePoints: {
    speed: "e9e4",
    arrow_split: "e985",
    arrow_circle_down: "f181",
    arrow_circle_up: "f182",
    counter_1: "f784",
    counter_2: "f783",
    counter_3: "f782",
    ios_share: "e6b8",
    light_mode: "e518",
  },
}

export default config
