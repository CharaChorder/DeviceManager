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
  sync: {
    TITLE_READ: "Neueste Änderungen werden abgerufen",
    TITLE_WRITE: "Änderungen werden gebrannt",
    DISCLAIMER_WRITE:
      "Das Brennen von Änderungen ist nur für Layouts und Einstellungen erforderlich wenn diese Neustarts überdauern sollen. Bei Akkorden passiert das brennen automatisch beim anwenden.",
  },
  backup: {
    TITLE: "Sicherungskopie",
    INDIVIDUAL: "Einzeldateien",
    DISCLAIMER:
      "Sicherungskopien verlassen unter keinen Umständen diesen Computer und werden nie mit uns geteilt oder auf Server hochgeladen.",
    DOWNLOAD: "Vollständig Speichern",
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
    TITLE: "Teilen",
    URL_COPIED: "Teilbare URL kopiert!",
    EXTRA_DOWNLOAD: "Als Datei herunterladen",
  },
  print: {
    TITLE: "Drucken",
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
    TITLE: "Änderungen importieren",
    ALL_CHANGES: "Alle Änderungen",
    layout: {
      TITLE: "{0} veränderte Belegung{{:|en}}",
      LAYER: "{changes} Belegung{{changes:|en}} in Ebene {layer} ändern",
    },
    settings: {
      TITLE: "{0} Einstellung{{|en}} anpassen",
    },
    chords: {
      TITLE: "{0} Akkorde",
      NEW_CHORDS: "{0} neue Akkord{{|e}} hinzufügen",
      CHANGED_CHORDS: "{0} Akkord{{|e}} ersetzen",
      DELETED_CHORDS: "{0} Akkord{{|e}} zum löschen markieren",
    },
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
