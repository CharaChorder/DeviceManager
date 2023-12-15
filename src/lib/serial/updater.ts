export async function updateDevice(port: SerialPort) {
  await port.open({
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    bufferSize: 255,;
  })

  const writer = port.writable!.getWriter()
  const reader = port.readable!.getReader()
}
