import { c as create_ssr_component, a as subscribe, e as each, b as add_attribute, d as escape, v as validate_component, i as is_promise, n as noop } from "../../chunks/ssr.js";
import "@material/material-color-utilities";
import { p as persistentWritable, s as syncStatus, a as serialPort, d as deviceSettings, b as deviceChords, c as deviceLayout, e as syncProgress } from "../../chunks/connection.js";
import { c as canShare } from "../../chunks/share.js";
import { L as LL, l as loadedLocales, a as loadedFormatters, d as detectLocale, b as locales, s as setLocale } from "../../chunks/i18n-svelte.js";
import { c as changes, s as settings, a as chords, l as layout, o as overlay } from "../../chunks/undo-redo.js";
/* empty css                                                  */import "hotkeys-js";
import { p as page } from "../../chunks/stores.js";
import "../../chunks/keymap-codes.js";
import { b as browser } from "../../chunks/environment2.js";
import { v as version } from "../../chunks/environment.js";
const notoSansMono = "";
const materialSymbolsRounded = "";
const scrollbar = "";
const tippy$1 = "";
const theme$1 = "";
const theme = persistentWritable("user-theme", {
  color: "#6D81C7",
  mode: "dark"
});
const userPreferences = persistentWritable("user-preferences", {
  backup: false,
  autoConnect: true
});
const BackupPopup_svelte_svelte_type_style_lang = "";
const ConnectionPopup_svelte_svelte_type_style_lang = "";
function client_method(key) {
  {
    if (key === "before_navigate" || key === "after_navigate" || key === "on_navigate") {
      return () => {
      };
    } else {
      const name_lookup = {
        disable_scroll_handling: "disableScrollHandling",
        preload_data: "preloadData",
        preload_code: "preloadCode",
        invalidate_all: "invalidateAll"
      };
      return () => {
        throw new Error(`Cannot call ${name_lookup[key] ?? key}(...) on the server`);
      };
    }
  }
}
const ConfigTabs_svelte_svelte_type_style_lang = "";
const css$6 = {
  code: "nav.svelte-1hx2o0l{display:flex;gap:8px;padding:8px;color:var(--md-sys-color-on-surface-variant);background:var(--md-sys-color-surface-variant);border:none;border-radius:32px}a.active.svelte-1hx2o0l{--icon-fill:1;color:var(--md-sys-color-on-primary);background:var(--md-sys-color-primary)}",
  map: null
};
const ConfigTabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let paths;
  let $LL, $$unsubscribe_LL;
  let $page, $$unsubscribe_page;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$6);
  paths = [
    {
      href: "/config/chords/",
      title: $LL.configure.chords.TITLE(),
      icon: "piano"
    },
    {
      href: "/config/layout/",
      title: $LL.configure.layout.TITLE(),
      icon: "keyboard"
    },
    {
      href: "/config/settings/",
      title: $LL.configure.settings.TITLE(),
      icon: "settings"
    }
  ];
  $$unsubscribe_LL();
  $$unsubscribe_page();
  return `<nav class="svelte-1hx2o0l">${each(paths, ({ href, title, icon }, i) => {
    return `<a${add_attribute("href", href, 0)} class="${["svelte-1hx2o0l", $page.url.pathname.startsWith(href) ? "active" : ""].join(" ").trim()}"><span class="icon">${escape(icon)}</span> ${escape(title)} </a>`;
  })}</nav> ${slots.default ? slots.default({}) : ``}`;
});
const Dialog_svelte_svelte_type_style_lang = "";
const ConfirmDialog_svelte_svelte_type_style_lang = "";
const EditActions_svelte_svelte_type_style_lang = "";
const css$5 = {
  code: ".click-me.svelte-13796cg{display:flex;align-items:center;justify-content:center;height:-moz-fit-content;height:fit-content;margin-inline:8px;padding-block:2px;padding-inline-start:4px;padding-inline-end:8px;font-family:inherit;font-weight:bold;color:var(--md-sys-color-primary);border:2px solid var(--md-sys-color-primary);border-radius:18px;outline:2px dashed var(--md-sys-color-primary);outline-offset:2px}.separator.svelte-13796cg{width:1px;height:24px;background:var(--md-sys-color-outline-variant)}",
  map: null
};
const EditActions = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_syncStatus;
  let $changes, $$unsubscribe_changes;
  let $$unsubscribe_serialPort;
  let $$unsubscribe_settings;
  let $$unsubscribe_deviceSettings;
  let $$unsubscribe_chords;
  let $$unsubscribe_deviceChords;
  let $$unsubscribe_layout;
  let $$unsubscribe_deviceLayout;
  let $$unsubscribe_overlay;
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_syncStatus = subscribe(syncStatus, (value) => value);
  $$unsubscribe_changes = subscribe(changes, (value) => $changes = value);
  $$unsubscribe_serialPort = subscribe(serialPort, (value) => value);
  $$unsubscribe_settings = subscribe(settings, (value) => value);
  $$unsubscribe_deviceSettings = subscribe(deviceSettings, (value) => value);
  $$unsubscribe_chords = subscribe(chords, (value) => value);
  $$unsubscribe_deviceChords = subscribe(deviceChords, (value) => value);
  $$unsubscribe_layout = subscribe(layout, (value) => value);
  $$unsubscribe_deviceLayout = subscribe(deviceLayout, (value) => value);
  $$unsubscribe_overlay = subscribe(overlay, (value) => value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let redoQueue = [];
  $$result.css.add(css$5);
  $$unsubscribe_syncStatus();
  $$unsubscribe_changes();
  $$unsubscribe_serialPort();
  $$unsubscribe_settings();
  $$unsubscribe_deviceSettings();
  $$unsubscribe_chords();
  $$unsubscribe_deviceChords();
  $$unsubscribe_layout();
  $$unsubscribe_deviceLayout();
  $$unsubscribe_overlay();
  $$unsubscribe_LL();
  return ` <button class="icon" ${$changes.length === 0 ? "disabled" : ""}>undo</button> <button class="icon" ${redoQueue.length === 0 ? "disabled" : ""}>redo</button> <div class="separator svelte-13796cg"></div> <button class="icon" data-svelte-h="svelte-8sije8">save</button> ${$changes.length !== 0 ? `<button class="click-me svelte-13796cg"><span class="icon" data-svelte-h="svelte-26p827">bolt</span>${escape($LL.saveActions.APPLY())}</button>` : ``}`;
});
const Navigation_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: ".separator.svelte-f5owx0{width:1px;height:24px;margin-inline:4px;background:var(--md-sys-color-outline-variant)}nav.svelte-f5owx0{display:grid;grid-template-columns:1fr auto 1fr;width:min(100%, 28cm);margin-block:8px;margin-inline:auto;padding-inline:16px}.title.svelte-f5owx0{display:flex;align-items:center;margin-block:0;font-size:1.5rem;font-weight:bold;color:var(--md-sys-color-primary);text-decoration:none}.icon.svelte-f5owx0{cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;padding:0;color:inherit;text-decoration:none;background:transparent;border:none;border-radius:50%;transition:all 250ms ease}.icon.error.svelte-f5owx0{color:var(--md-sys-color-on-error);background:var(--md-sys-color-error)}.actions.svelte-f5owx0{display:flex;align-items:center}.actions.svelte-f5owx0:last-child{justify-content:flex-end}.svelte-f5owx0:disabled{pointer-events:none;opacity:0.5}",
  map: null
};
const Navigation = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $userPreferences, $$unsubscribe_userPreferences;
  let $canShare, $$unsubscribe_canShare;
  let $$unsubscribe_LL;
  let $serialPort, $$unsubscribe_serialPort;
  let $syncStatus, $$unsubscribe_syncStatus;
  $$unsubscribe_userPreferences = subscribe(userPreferences, (value) => $userPreferences = value);
  $$unsubscribe_canShare = subscribe(canShare, (value) => $canShare = value);
  $$unsubscribe_LL = subscribe(LL, (value) => value);
  $$unsubscribe_serialPort = subscribe(serialPort, (value) => $serialPort = value);
  $$unsubscribe_syncStatus = subscribe(syncStatus, (value) => $syncStatus = value);
  let connectButton;
  $$result.css.add(css$4);
  $$unsubscribe_userPreferences();
  $$unsubscribe_canShare();
  $$unsubscribe_LL();
  $$unsubscribe_serialPort();
  $$unsubscribe_syncStatus();
  return `<nav class="svelte-f5owx0"><div class="actions svelte-f5owx0">${validate_component(EditActions, "EditActions").$$render($$result, {}, {}, {})}</div> ${validate_component(ConfigTabs, "ConfigTabs").$$render($$result, {}, {}, {})} <div class="actions svelte-f5owx0">${$canShare ? `<button class="icon svelte-f5owx0" data-svelte-h="svelte-1n97s3u">share</button> <button class="icon svelte-f5owx0" data-svelte-h="svelte-1qaz7dv">print</button> <div class="separator svelte-f5owx0"></div>` : ``} ${{}.TAURI_FAMILY === void 0 ? `${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function({ default: PwaStatus }) {
      return ` ${validate_component(PwaStatus, "PwaStatus").$$render($$result, {}, {}, {})} `;
    }(__value);
  }(import("../../chunks/PwaStatus.js"))}` : ``} ${$serialPort ? `<button class="${"icon " + escape($syncStatus, true) + " svelte-f5owx0"}">${$userPreferences.backup ? `history` : `history_toggle_off`}</button>` : ``} <button class="${["icon connect svelte-f5owx0", $serialPort === void 0 ? "error" : ""].join(" ").trim()}"${add_attribute("this", connectButton, 0)} data-svelte-h="svelte-1v2t87w">cable</button></div> </nav>`;
});
const BrowserWarning_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: "dialog.svelte-6mulel.svelte-6mulel{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100vw;height:100vh;color:var(--md-sys-color-on-error);background:var(--md-sys-color-error);border:none}dialog.svelte-6mulel>.svelte-6mulel{max-width:20cm}div.svelte-6mulel.svelte-6mulel{display:flex;gap:16px}a.svelte-6mulel.svelte-6mulel{color:var(--md-sys-color-on-error)}div.svelte-6mulel>a.svelte-6mulel{display:flex;gap:8px;align-items:center;list-style:none}dialog.svelte-6mulel.svelte-6mulel::backdrop{opacity:0.8;background:black}h1.svelte-6mulel.svelte-6mulel{color:inherit}",
  map: null
};
const BrowserWarning = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$result.css.add(css$3);
  $$unsubscribe_LL();
  return `<dialog open class="svelte-6mulel"><h1 class="svelte-6mulel">${escape($LL.browserWarning.TITLE())}</h1> <p class="svelte-6mulel">${escape($LL.browserWarning.INFO_SERIAL_PREFIX())}<a class="normal svelte-6mulel" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility">${escape($LL.browserWarning.INFO_SERIAL_INFIX())}</a>${escape($LL.browserWarning.INFO_SERIAL_SUFFIX())} ${escape($LL.browserWarning.INFO_BROWSER_PREFIX())} <a href="https://github.com/brave/brave-browser/issues/13902" target="_blank" class="svelte-6mulel">${escape($LL.browserWarning.INFO_BROWSER_INFIX())}</a>${escape($LL.browserWarning.INFO_BROWSER_SUFFIX())}</p> <div class="svelte-6mulel"><a href="https://github.com/Theaninova/dotio/releases" target="_blank" class="svelte-6mulel">${escape($LL.browserWarning.DOWNLOAD_APP())}</a></div> </dialog>`;
});
const shiftAway = "";
const tippy = "";
const initFormatters = (locale) => {
  const formatters = {
    // add your formatter functions here
  };
  return formatters;
};
const de = {
  TITLE: "CharaChorder Gerätemanager",
  DESCRIPTION: "Gerätemanager und Konfigurationstool für CharaChorder Geräte.",
  saveActions: {
    UNDO: "Rückgängig (<kbd class='icon'>shift</kbd> halten um alle Änderungen rückgängig zu machen)",
    REDO: "Wiederholen",
    APPLY: "Anwenden",
    SAVE: "Änderungen auf das Gerät schreiben"
  },
  sync: {
    TITLE_READ: "Neueste Änderungen werden abgerufen",
    TITLE_WRITE: "Änderungen werden gebrannt",
    DISCLAIMER_WRITE: "Das Brennen von Änderungen ist nur für Layouts und Einstellungen erforderlich wenn diese Neustarts überdauern sollen. Bei Akkorden passiert das brennen automatisch beim anwenden."
  },
  backup: {
    TITLE: "Sicherungskopie",
    INDIVIDUAL: "Einzeldateien",
    DISCLAIMER: "Sicherungskopien verlassen unter keinen Umständen diesen Computer und werden nie mit uns geteilt oder auf Server hochgeladen.",
    DOWNLOAD: "Vollständig Speichern",
    RESTORE: "Wiederherstellen"
  },
  modal: {
    CLOSE: "Schließen"
  },
  actionSearch: {
    PLACEHOLDER: "Nach Aktionen suchen",
    CURRENT_ACTION: "Aktuelle Aktion",
    DELETE: "Entfernen",
    filter: {
      ALL: "Alle"
    }
  },
  share: {
    TITLE: "Teilen",
    URL_COPIED: "Teilbare URL kopiert!",
    EXTRA_DOWNLOAD: "Als Datei herunterladen"
  },
  print: {
    TITLE: "Drucken"
  },
  profile: {
    TITLE: "Profil",
    LANGUAGE: "Sprache",
    theme: {
      TITLE: "Darstellung",
      COLOR_SCHEME: "Farbschema",
      DARK_MODE: "Dunkel",
      LIGHT_MODE: "Hell"
    }
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
      BOOTLOADER: "Bootloader"
    }
  },
  browserWarning: {
    TITLE: "Warnung",
    INFO_SERIAL_PREFIX: "Der aktuell genutzte Browser wird aufgrund der speziellen Voraussetzung für Kommunikation über die ",
    INFO_SERIAL_INFIX: "serielle Schnittstelle",
    INFO_SERIAL_SUFFIX: " nicht unterstützt.",
    INFO_BROWSER_PREFIX: "Auch wenn alle Chromium-basieren Desktop Browser diese Voraussetzung grundsätzlich erfüllen, haben einige Browser ",
    INFO_BROWSER_INFIX: "wie zum Beispiel Brave",
    INFO_BROWSER_SUFFIX: " sich bewusst dazu entschieden die API zu deaktivieren.",
    DOWNLOAD_APP: "Desktop-app herunterladen"
  },
  changes: {
    TITLE: "Änderungen importieren",
    ALL_CHANGES: "Alle Änderungen",
    layout: {
      TITLE: "{0} veränderte Belegung{{:|en}}",
      LAYER: "{changes} Belegung{{changes:|en}} in Ebene {layer} ändern"
    },
    settings: {
      TITLE: "{0} Einstellung{{|en}} anpassen"
    },
    chords: {
      TITLE: "{0} Akkorde",
      NEW_CHORDS: "{0} neue Akkord{{|e}} hinzufügen",
      CHANGED_CHORDS: "{0} Akkord{{|e}} ersetzen",
      DELETED_CHORDS: "{0} Akkord{{|e}} zum löschen markieren"
    }
  },
  configure: {
    chords: {
      TITLE: "Akkorde",
      HOLD_KEYS: "Akkord halten",
      NEW_CHORD: "Neuer Akkord",
      search: {
        PLACEHOLDER: "{0} Akkord{{|e}} durchsuchen"
      },
      conflict: {
        TITLE: "Akkordkonflikt",
        DESCRIPTION: "Der Akkord {0} würde einen bereits existierenden Akkord überschreiben. Wirklich fortfahren?",
        CONFIRM: "Überschreiben",
        ABORT: "Überspringen"
      }
    },
    layout: {
      TITLE: "Layout"
    },
    settings: {
      TITLE: "Einstellungen"
    }
  },
  plugin: {
    editor: {
      RUN: "Ausführen"
    }
  }
};
const en = {
  TITLE: "CharaChorder Device Manager",
  DESCRIPTION: "The device manager and configuration tool for CharaChorder devices.",
  saveActions: {
    UNDO: "Undo (hold <kbd class='icon'>shift</kbd> to undo all changes)",
    REDO: "Redo",
    APPLY: "Apply",
    SAVE: "Burn changes to your device"
  },
  backup: {
    TITLE: "Local Backup",
    INDIVIDUAL: "Individual backups",
    DISCLAIMER: "Backups remain on your computer and are never shared with us or uploaded to our servers.",
    DOWNLOAD: "Full Backup",
    RESTORE: "Restore"
  },
  sync: {
    TITLE_READ: "Reading latest changes",
    TITLE_WRITE: "Burning changes to device",
    DISCLAIMER_WRITE: "Burning is only necessary if you want your layout or settings to persist across reboots. Chords always persist automatically on apply."
  },
  modal: {
    CLOSE: "Close"
  },
  actionSearch: {
    PLACEHOLDER: "Search for actions",
    CURRENT_ACTION: "Current action",
    DELETE: "Remove",
    filter: {
      ALL: "All"
    }
  },
  share: {
    TITLE: "Share",
    URL_COPIED: "Sharable URL copied!",
    EXTRA_DOWNLOAD: "Download as file"
  },
  print: {
    TITLE: "Print"
  },
  profile: {
    TITLE: "Profile",
    LANGUAGE: "Language",
    theme: {
      TITLE: "Theme",
      COLOR_SCHEME: "Color scheme",
      DARK_MODE: "Dark",
      LIGHT_MODE: "Light"
    }
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
      BOOTLOADER: "Bootloader"
    }
  },
  browserWarning: {
    TITLE: "Warning",
    INFO_SERIAL_PREFIX: "Your current browser is not supported due to this site's unique requirement for ",
    INFO_SERIAL_INFIX: "serial connections",
    INFO_SERIAL_SUFFIX: ".",
    INFO_BROWSER_PREFIX: "Though all chromium-based desktop browsers fulfill this requirement, some derivations such as Brave ",
    INFO_BROWSER_INFIX: "have been known to disable the API intentionally",
    INFO_BROWSER_SUFFIX: ".",
    DOWNLOAD_APP: "Download the desktop app"
  },
  changes: {
    TITLE: "Import changes",
    ALL_CHANGES: "All changes",
    layout: {
      TITLE: "{0} layout change{{|s}}",
      LAYER: "Update {changes} key{{changes:|s}} in layer {layer}"
    },
    settings: {
      TITLE: "Update {0} setting{{|s}}"
    },
    chords: {
      TITLE: "{0} chords",
      NEW_CHORDS: "Add {0} new chord{{|s}}",
      CHANGED_CHORDS: "Replace {0} chord{{|s}}",
      DELETED_CHORDS: "Mark {0} chord{{|s}} for deletion"
    }
  },
  configure: {
    chords: {
      TITLE: "Chords",
      HOLD_KEYS: "Hold chord",
      NEW_CHORD: "New chord",
      search: {
        PLACEHOLDER: "Search {0} chord{{|s}}"
      },
      conflict: {
        TITLE: "Chord conflict",
        DESCRIPTION: "Your chord {0} conflicts with an existing chord. Are you sure you want to overwrite this chord?",
        CONFIRM: "Overwrite",
        ABORT: "Skip"
      }
    },
    layout: {
      TITLE: "Layout"
    },
    settings: {
      TITLE: "Settings"
    }
  },
  plugin: {
    editor: {
      RUN: "Run"
    }
  }
};
const localeTranslations = {
  de,
  en
};
const loadLocale = (locale) => {
  if (loadedLocales[locale])
    return;
  loadedLocales[locale] = localeTranslations[locale];
  loadFormatters(locale);
};
const loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters());
const Footer_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: "select.svelte-1khtm7g.svelte-1khtm7g{position:absolute;opacity:0}input[type=color].svelte-1khtm7g.svelte-1khtm7g{cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;inline-size:20px;block-size:20px;margin:0;padding:0;color:inherit;background:transparent;border:none;border-radius:50%}input[type=color].svelte-1khtm7g.svelte-1khtm7g::-webkit-color-swatch-wrapper{padding:0}input[type=color].svelte-1khtm7g.svelte-1khtm7g::-webkit-color-swatch{border:none}footer.svelte-1khtm7g.svelte-1khtm7g{position:absolute;bottom:0;left:0;display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px;opacity:0.4}ul.svelte-1khtm7g.svelte-1khtm7g{display:flex;gap:16px;align-items:center;margin:0;padding:0;list-style:none}ul.svelte-1khtm7g.svelte-1khtm7g:last-child{gap:12px}ul.svelte-1khtm7g:last-child button.svelte-1khtm7g{height:24px;font-size:20px}a.svelte-1khtm7g.svelte-1khtm7g{display:flex;align-items:center;justify-content:center;font-size:12px;text-decoration:none}.icon.svelte-1khtm7g.svelte-1khtm7g{font-size:16px}",
  map: null
};
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $theme, $$unsubscribe_theme;
  let $$unsubscribe_LL;
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  $$unsubscribe_LL = subscribe(LL, (value) => value);
  detectLocale();
  let languageSelect;
  $$result.css.add(css$2);
  $$unsubscribe_theme();
  $$unsubscribe_LL();
  return `<footer class="svelte-1khtm7g"><ul class="svelte-1khtm7g"><li> <a${add_attribute("href", "https://github.com/CharaChorder/DeviceManager", 0)} rel="noreferrer" target="_blank" class="svelte-1khtm7g"><span class="icon svelte-1khtm7g" data-svelte-h="svelte-12xlk8t">commit</span> v${escape(version)}</a></li> <li data-svelte-h="svelte-17enmor"><a${add_attribute("href", "https://github.com/CharaChorder/DeviceManager/issues", 0)} rel="noreferrer" target="_blank" class="svelte-1khtm7g"><span class="icon svelte-1khtm7g">bug_report</span> File an issue</a></li></ul> <ul class="svelte-1khtm7g"><li><input type="color" class="svelte-1khtm7g"${add_attribute("value", $theme.color, 0)}></li> <li>${$theme.mode === "light" ? `<button class="icon svelte-1khtm7g" data-svelte-h="svelte-f5c4og">dark_mode</button>` : `${$theme.mode === "dark" ? `<button class="icon svelte-1khtm7g" data-svelte-h="svelte-1jn44gg">light_mode</button>` : ``}`}</li> <li><button class="icon svelte-1khtm7g">translate

        <select class="svelte-1khtm7g"${add_attribute("this", languageSelect, 0)}>${each(locales, (code) => {
    return `<option${add_attribute("value", code, 0)}>${escape(code)}</option>`;
  })}</select></button></li></ul> </footer>`;
});
const beforeNavigate = /* @__PURE__ */ client_method("before_navigate");
const afterNavigate = /* @__PURE__ */ client_method("after_navigate");
const PageTransition = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let animationDone;
  let isNavigating = false;
  const routeOrder = ["/config/chords/", "/config/layout/", "/config/settings/"];
  beforeNavigate((navigation) => {
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    isNavigating = true;
    if (!(from && to && routeOrder.includes(from) && routeOrder.includes(to))) {
      return;
    }
    animationDone = new Promise((resolve) => {
    });
  });
  afterNavigate(async () => {
    await animationDone;
    isNavigating = false;
  });
  return `${!isNavigating ? `<main>${slots.default ? slots.default({}) : ``}</main>` : ``}`;
});
const SyncOverlay_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "dialog.svelte-1xbxmaz::backdrop{background:rgba(0, 0, 0, 0.7)}progress.svelte-1xbxmaz{overflow:hidden;width:100%;height:16px;border-radius:8px}progress.svelte-1xbxmaz::-webkit-progress-bar{background:var(--md-sys-color-background)}progress.svelte-1xbxmaz::-webkit-progress-value{background:var(--md-sys-color-primary)}dialog.svelte-1xbxmaz{max-width:14cm;padding:2cm;color:white;background:none;border:none;outline:none}",
  map: null
};
const SyncOverlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_syncStatus;
  let $LL, $$unsubscribe_LL;
  let $syncProgress, $$unsubscribe_syncProgress;
  $$unsubscribe_syncStatus = subscribe(syncStatus, (value) => value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_syncProgress = subscribe(syncProgress, (value) => $syncProgress = value);
  let dialog;
  $$result.css.add(css$1);
  $$unsubscribe_syncStatus();
  $$unsubscribe_LL();
  $$unsubscribe_syncProgress();
  return `<dialog class="svelte-1xbxmaz"${add_attribute("this", dialog, 0)}>${`<h2>${escape($LL.sync.TITLE_WRITE())}</h2> <p>${escape($LL.sync.DISCLAIMER_WRITE())}</p>`} <progress${add_attribute("max", $syncProgress?.max ?? 1, 0)}${add_attribute("value", $syncProgress?.current ?? 1, 0)} class="svelte-1xbxmaz"></progress> </dialog>`;
});
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: 'body{overflow:hidden;display:flex;flex-direction:column;width:100vw;height:100vh;margin:0;font-family:"Noto Sans Mono", monospace;color:var(--md-sys-color-on-background);background:var(--md-sys-color-background)}main{contain:strict;display:flex;flex-direction:column;flex-grow:1;align-items:center;padding:16px}h1{margin-block-start:0;font-size:4rem;font-weight:700;color:var(--md-sys-color-secondary)}',
  map: null
};
let webManifestLink = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userPreferences;
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_userPreferences = subscribe(userPreferences, (value) => value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  const locale = detectLocale();
  loadLocale(locale);
  setLocale(locale);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  $$unsubscribe_userPreferences();
  $$unsubscribe_LL();
  return `${$$result.head += `<!-- HEAD_svelte-1o8823w_START --><!-- HTML_TAG_START -->${webManifestLink}<!-- HTML_TAG_END -->${$$result.title = `<title>${escape($LL.TITLE())}</title>`, ""}<meta name="description"${add_attribute("content", $LL.DESCRIPTION(), 0)}><meta name="theme-color"${add_attribute("content", data.themeColor, 0)}><!-- HEAD_svelte-1o8823w_END -->`, ""} ${validate_component(SyncOverlay, "SyncOverlay").$$render($$result, {}, {}, {})} ${validate_component(Navigation, "Navigation").$$render($$result, {}, {}, {})}  ${validate_component(PageTransition, "PageTransition").$$render($$result, {}, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })} ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})} ${{}.TAURI_FAMILY === void 0 && browser && !("serial" in navigator) ? `${validate_component(BrowserWarning, "BrowserWarning").$$render($$result, {}, {}, {})}` : ``}`;
});
export {
  Layout as default
};
