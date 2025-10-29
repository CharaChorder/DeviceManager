export interface CCOSInitEvent {
  type: "init";
  url: string;
}

export interface CCOSKeyPressEvent {
  type: "press";
  code: number;
}

export interface CCOSKeyReleaseEvent {
  type: "release";
  code: number;
}

export interface CCOSSerialEvent {
  type: "serial";
  data: Uint8Array;
}

export type CCOSInEvent =
  | CCOSInitEvent
  | CCOSKeyPressEvent
  | CCOSKeyReleaseEvent
  | CCOSSerialEvent;

export interface CCOSReportEvent {
  type: "report";
  modifiers: number;
  keys: number[];
}

export interface CCOSReadyEvent {
  type: "ready";
}

export type CCOSOutEvent = CCOSReportEvent | CCOSReadyEvent | CCOSSerialEvent;
