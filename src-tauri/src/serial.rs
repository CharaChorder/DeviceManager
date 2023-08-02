use serde::Serialize;
use serialport::{available_ports, SerialPortType};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{command, generate_handler, Runtime};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("serial")
        .invoke_handler(generate_handler![get_serial_ports])
        .build()
}

#[derive(Serialize)]
struct WebSerialPortInfo {
    pub name: String,
    pub product_id: u16,
    pub vendor_id: u16,
    pub serial_number: Option<String>,
    pub manufacturer: Option<String>,
    pub product: Option<String>,
}

#[command]
fn get_serial_ports() -> Vec<WebSerialPortInfo> {
    available_ports()
        .unwrap()
        .iter()
        .filter_map(|port| match &port.port_type {
            SerialPortType::UsbPort(usb) => Some(WebSerialPortInfo {
                name: port.port_name.clone(),
                vendor_id: usb.vid,
                product_id: usb.pid,
                serial_number: usb.serial_number.clone(),
                manufacturer: usb.manufacturer.clone(),
                product: usb.product.clone(),
            }),
            _ => None,
        })
        .collect()
}
