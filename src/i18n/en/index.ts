import type {BaseTranslation} from "../i18n-types"

const en = {
  TITLE: "CharaChorder Device Manager",
  DESCRIPTION: "The device manager and configuration tool for CharaChorder devices.",
  saveActions: {
    UNDO: "Undo (hold <kbd class='icon'>shift</kbd> to undo all changes)",
    REDO: "Redo",
    APPLY: "Apply",
    SAVE: "Write changes to your device",
  },
  backup: {
    TITLE: "Local Backup",
    DISCLAIMER: "Backups remain on your computer and are never shared with us or uploaded to our servers.",
    DOWNLOAD: "Download Backup",
    RESTORE: "Restore",
  },
  modal: {
    CLOSE: "Close",
  },
  actionSearch: {
    PLACEHOLDER: "Search for actions",
    CURRENT_ACTION: "Current action",
    DELETE: "Remove",
    filter: {
      ALL: "All",
    },
  },
  share: {
    URL_COPIED: "Sharable URL copied!",
    EXTRA_DOWNLOAD: "Download as file",
  },
  profile: {
    TITLE: "Profile",
    LANGUAGE: "Language",
    theme: {
      TITLE: "Theme",
      COLOR_SCHEME: "Color scheme",
      DARK_MODE: "Dark",
      LIGHT_MODE: "Light",
    },
  },
  deviceManager: {
    TITLE: "Device",
    AUTO_CONNECT: "Auto-connect",
    CONNECT: "Connect",
    DISCONNECT: "Disconnect",
    TERMINAL: "Terminal",
    APPLY_SETTINGS: "Flash changes to device",
    bootMenu: {
      TITLE: "Boot Menu",
      REBOOT: "Reboot",
      BOOTLOADER: "Bootloader",
    },
  },
  browserWarning: {
    TITLE: "Warning",
    INFO_SERIAL_PREFIX: "Your current browser is not supported due to this site's unique requirement for ",
    INFO_SERIAL_INFIX: "serial connections",
    INFO_SERIAL_SUFFIX: ".",
    INFO_BROWSER_PREFIX:
      "Though all chromium-based desktop browsers fulfill this requirement, some derivations such as Brave ",
    INFO_BROWSER_INFIX: "have been known to disable the API intentionally",
    INFO_BROWSER_SUFFIX: ".",
    DOWNLOAD_APP: "Download the desktop app",
  },
  changes: {
    TITLE: "Apply changes",
    CHORD_ADD: "{0} chord{{|s}} added",
    CHORD_EDIT: "{0} chord{{|s}} edited",
    CHORD_DELETE: "{0} chord{{|s}} deleted",
    SETTING_CHANGE: "{0} setting{{|s}} changed",
    LAYOUT_CHANGE: "{0} layout key{{|s}} changed",
  },
  configure: {
    chords: {
      TITLE: "Chords",
      search: {
        PLACEHOLDER: "Search {0} chord{{|s}}",
      },
    },
    layout: {
      TITLE: "Layout",
    },
    settings: {
      TITLE: "Settings",
    },
  },
  plugin: {
    editor: {
      RUN: "Run",
    },
  },
} satisfies BaseTranslation

export default en
