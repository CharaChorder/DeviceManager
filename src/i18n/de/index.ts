import type {Translation} from "../i18n-types"

const de = {
  TITLE: "amaCC1ng",
  backup: {
    TITLE: "Sicherungskopie",
    DISCLAIMER:
      "Sicherungskopien verlassen unter keinen Umständen diesen Computer und werden nie mit uns geteilt oder auf Server hochgeladen.",
    DOWNLOAD: "Kopie Speichern",
    RESTORE: "Wiederherstellen",
  },
  profile: {
    TITLE: "Profil",
    LANGUAGE: "Sprache",
    theme: {
      TITLE: "Darstellung",
      COLOR_SCHEME: "Farbschema",
      DARK_MODE: "Dunkel",
      LIGHT_MODE: "Hell",
    },
  },
  deviceManager: {
    TITLE: "Gerät",
    AUTO_CONNECT: "Automatisch Verbinden",
    CONNECT: "Verbinden",
    DISCONNECT: "Entfernen",
    TERMINAL: "Konsole",
    APPLY_SETTINGS: "Änderungen auf das Gerät brennen",
    bootMenu: {
      TITLE: "Bootmenü",
      REBOOT: "Neustarten",
      BOOTLOADER: "Bootloader",
    },
  },
  browserWarning: {
    TITLE: "Warnung",
    INFO_SERIAL_PREFIX:
      "Der aktuell genutzte Browser wird aufgrund der speziellen Voraussetzung für Kommunikation über die ",
    INFO_SERIAL_INFIX: "serielle Schnittstelle",
    INFO_SERIAL_SUFFIX: " nicht unterstützt.",
    INFO_BROWSER_PREFIX:
      "Auch wenn alle Chromium-basieren Desktop Browser diese Voraussetzung grundsätzlich erfüllen, haben einige Browser ",
    INFO_BROWSER_INFIX: "wie zum Beispiel Brave",
    INFO_BROWSER_SUFFIX: " sich bewusst dazu entschieden die API zu deaktivieren.",
    DOWNLOAD_APP: "Desktop-app herunterladen",
  },
  configure: {
    chords: {
      TITLE: "Akkorde",
      search: {
        PLACEHOLDER: "{0} Akkord{{|e}} durchsuchen",
      },
    },
    layout: {
      TITLE: "Layout",
    },
    settings: {
      TITLE: "Einstellungen",
    },
  },
  plugin: {
    editor: {
      RUN: "Ausführen",
    },
  },
} satisfies Translation

export default de
