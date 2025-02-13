import type {
  CharaChordFile,
  CharaLayoutFile,
  CharaSettingsFile,
} from "$lib/share/chara-file";
import type { KeymapCategory } from "./actions";

export interface RawVersionMeta {
  version: string;
  target: string;
  git_commit: string;
  git_is_dirty: boolean;
  git_date: string;
  public_build: boolean;
  development_mode: number;
  actions: string;
  factory_defaults: {
    layout: string;
    settings: string;
    chords: Record<string, string>;
  };
  update: {
    ota: string | null;
    uf2: string | null;
    esptool: EspToolData | null;
  };
  files: string[];
  spi_flash: SPIFlashInfo | null;
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
  factoryDefaults?: {
    layout: CharaLayoutFile;
    settings: CharaSettingsFile;
    chords: Record<string, CharaChordFile>;
  };
  update: {
    ota?: string;
    uf2?: string;
    esptool?: EspToolData;
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
