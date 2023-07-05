export async function bootLoader() {
  //Sends the bootloader command to the charachorder via the serial API
  await sendCommandString("BOOTLOADER")
  await readGetNone()
}

export async function reboot() {
  //Sends the restart command to the charachorder via the serial API
  await sendCommandString("RESTART")
  await readGetNone()
}
