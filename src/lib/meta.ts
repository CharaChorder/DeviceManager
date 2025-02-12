export interface VersionMeta {
  version: string;
  target: string;
  git_commit: string;
  git_is_dirty: boolean;
  git_date: string;
  public_build: boolean;
  development_mode: number;
  update: {
    ota: string | null;
    uf2: string | null;
    esptool: EspToolData | null;
  };
  files: string[];
  spi_flash: SPIFlashInfo | null;
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
