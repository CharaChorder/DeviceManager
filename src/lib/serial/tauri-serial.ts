import {invoke} from "@tauri-apps/api"

// @ts-expect-error polyfill
// noinspection JSConstantReassignment
navigator.serial = {
  getPorts(): Promise<SerialPort[]> {
    return invoke<any[]>("plugin:serial|get_serial_ports").then(ports =>
      ports.map<Partial<SerialPort>>(port => ({
        getInfo() {
          return {
            name: port["name"],
            usbVendorId: port["vendor_id"],
            usbProductId: port["product_id"],
            serialNumber: port["serial_number"],
            manufacturer: port["manufacturer"],
            product: port["product"],
          } as SerialPortInfo
        },
      })),
    ) as Promise<SerialPort[]>
  },
}
