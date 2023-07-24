export interface DeviceSettings {
  enableSerialLog: boolean
  enableSerialRaw: boolean
  enableSerialChord: boolean
  enableSerialKeyboard: boolean
  enableSerialMouse: boolean
  enableSerialDebug: boolean
  enableSerialHeader: boolean
  enableHidKeyboard: boolean
  pressThreshold: number
  releaseThreshold: number
  enableHidMouse: number
  scrollDelay: number
  enableSpurring: boolean
  spurKillerToggle: number
  spurKiller: number
  enableChording: boolean
  charKillerToggle: number
  charCounterKiller: number
}

export const SETTING_IDS: Record<keyof DeviceSettings, number> = {
  enableSerialLog: 0x01,
  enableSerialRaw: 0x02,
  enableSerialChord: 0x03,
  enableSerialKeyboard: 0x04,
  enableSerialMouse: 0x05,
  enableSerialDebug: 0x06,
  enableSerialHeader: 0x07,
  enableHidKeyboard: 0x0a,
  pressThreshold: 0x0b,
  releaseThreshold: 0x0c,
  enableHidMouse: 0x14,
  scrollDelay: 0x15,
  enableSpurring: 0x1e,
  spurKillerToggle: 0x1f,
  spurKiller: 0x20,
  enableChording: 0x28,
  charKillerToggle: 0x29,
  charCounterKiller: 0x2a,
}
