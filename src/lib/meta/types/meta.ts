import type {
  CharaChordFile,
  CharaLayoutFile,
  CharaSettingsFile,
} from "$lib/share/chara-file";
import type { KeymapCategory } from "./actions";

export interface SettingsMeta {
  name: string;
  description?: string;
  items: SettingsItemMeta[];
}

export interface SettingsItemMeta {
  id: number;
  name?: string;
  description?: string;
  enum?: string[];
  range: [number, number];
  step?: number;
  unit?: string;
  inverse?: number;
  scale?: number;
}

export interface ChangelogEntry {
  summary: string;
  description: string;
}

export interface Changelog {
  features: ChangelogEntry[];
  fixes: ChangelogEntry[];
}

export interface RawVersionMeta {
  version: string;
  target: string;
  git_commit: string;
  git_is_dirty: boolean;
  git_date: string;
  public_build: boolean;
  development_mode: number;
  actions: string;
  settings: string;
  changelog: string;
  recipes: string;
  factory_defaults: {
    layout: string;
    settings: string;
    chords: Record<string, string>;
  };
  update: {
    ota: string | null;
    uf2: string | null;
    esptool: EspToolData | null;
    js: string | null;
    wasm: string | null;
    dll: string | null;
    so: string | null;
  };
  files: string[];
  spi_flash: SPIFlashInfo | null;
}

export interface E2eAddChord {
  input: string[][];
  output: string[];
}

export interface E2eTestItem {
  keys?: string[];
  modifiers?: Record<string, boolean>;
  press?: string[];
  release?: string[];
  step?: number;
  idle?: boolean;
  clearChords?: boolean;
  addChords?: E2eAddChord[];
  settings: Record<string, Record<string, string | number>>;
}

export interface E2eTest {
  matrix?: string[];
  test: E2eTestItem[];
}

export interface E2eDemo {
  demo?: {
    id?: string;
    title?: string;
    description?: string;
  };
  matrix?: string[];
  tests: E2eTest[];
}

export interface VersionMeta {
  version: string;
  device: string;
  path: string;
  date: Date;
  public: boolean;
  commit?: string;
  dirty: boolean;
  developmentBuild: boolean;
  actions: KeymapCategory[];
  settings: SettingsMeta[];
  changelog: Changelog;
  recipes?: E2eTest[];
  factoryDefaults?: {
    layout: CharaLayoutFile;
    settings: CharaSettingsFile;
    chords: Record<string, CharaChordFile>;
  };
  update: {
    ota?: string;
    uf2?: string;
    esptool?: EspToolData;
    js?: string;
    wasm?: string;
    dll?: string;
    so?: string;
  };
  spiFlash?: SPIFlashInfo;
}

export interface SPIFlashInfo {
  type: string;
  size: string;
  connection: SPIConnection;
}

export interface SPIConnection {
  clk: number;
  q: number;
  d: number;
  hd: number;
  cs: number;
}

export interface EspToolData {
  chip: string;
  baud: string;
  before: string;
  after: string;
  flash_mode: string;
  flash_freq: string;
  flash_size: string;
  files: Record<string, string>;
}
