import type {Translation} from "../i18n-types"

const de = {
  TITLE: "CharaChorder Gerätemanager",
  DESCRIPTION: "Gerätemanager und Konfigurationstool für CharaChorder Geräte.",
  saveActions: {
    UNDO: "Rückgängig (<kbd class='icon'>shift</kbd> halten um alle Änderungen rückgängig zu machen)",
    REDO: "Wiederholen",
    APPLY: "Anwenden",
    SAVE: "Änderungen auf das Gerät schreiben",
  },
  backup: {
    TITLE: "Sicherungskopie",
    DISCLAIMER:
      "Sicherungskopien verlassen unter keinen Umständen diesen Computer und werden nie mit uns geteilt oder auf Server hochgeladen.",
    DOWNLOAD: "Kopie Speichern",
    RESTORE: "Wiederherstellen",
  },
  modal: {
    CLOSE: "Schließen",
  },
  actionSearch: {
    PLACEHOLDER: "Nach Aktionen suchen",
    CURRENT_ACTION: "Aktuelle Aktion",
    DELETE: "Entfernen",
    filter: {
      ALL: "Alle",
    },
  },
  share: {
    URL_COPIED: "Teilbare URL kopiert!",
    EXTRA_DOWNLOAD: "Als Datei herunterladen",
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
  changes: {
    TITLE: "Änderungen anwenden",
    CHORD_ADD: "{0} Akkord{{|e}} hinzugefügt",
    CHORD_EDIT: "{0} Akkord{{|e}} bearbeitet",
    CHORD_DELETE: "{0} Akkord{{|e}} entfernt",
    SETTING_CHANGE: "{0} Einstellung{{|en}} geändert",
    LAYOUT_CHANGE: "{0} Layout-belegung{{|en}} geändert",
  },
  configure: {
    chords: {
      TITLE: "Akkorde",
      HOLD_KEYS: "Akkord halten",
      NEW_CHORD: "Neuer Akkord",
      search: {
        PLACEHOLDER: "{0} Akkord{{|e}} durchsuchen",
      },
      conflict: {
        TITLE: "Akkordkonflikt",
        DESCRIPTION:
          "Der Akkord {0} würde einen bereits existierenden Akkord überschreiben. Wirklich fortfahren?",
        CONFIRM: "Überschreiben",
        ABORT: "Überspringen",
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
