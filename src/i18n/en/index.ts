import type {BaseTranslation} from "../i18n-types"

const en = {
  TITLE: "amaCC1ng",
  backup: {
    TITLE: "Local Backup",
    DISCLAIMER: "Backups remain on your computer and are never shared with us or uploaded to our servers.",
    DOWNLOAD: "Download Backup",
    RESTORE: "Restore",
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
