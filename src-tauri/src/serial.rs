use serde::Serialize;
use serialport::{available_ports, SerialPort, SerialPortType};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{command, generate_handler, Manager, Runtime, State};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("serial")
        .invoke_handler(generate_handler![
            get_serial_ports,
            open,
            close,
            read,
            write
        ])
        .setup(move |app_handle| {
            app_handle.manage(SerialState::default());
            Ok(())
        })
        .build()
}

#[derive(Default)]
pub struct SerialState {
    handles: Arc<Mutex<HashMap<String, Box<dyn SerialPort>>>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WebSerialPortInfo {
    pub name: String,
    pub usb_product_id: u16,
    pub usb_vendor_id: u16,
    pub serial_number: Option<String>,
    pub manufacturer: Option<String>,
    pub product: Option<String>,
}

#[command]
fn get_serial_ports() -> Result<Vec<WebSerialPortInfo>, String> {
    Ok(available_ports()
        .map_err(|err| err.to_string())?
        .iter()
        .filter_map(|port| match &port.port_type {
            SerialPortType::UsbPort(usb) => Some(WebSerialPortInfo {
                name: port.port_name.clone(),
                usb_vendor_id: usb.vid,
                usb_product_id: usb.pid,
                serial_number: usb.serial_number.clone(),
                manufacturer: usb.manufacturer.clone(),
                product: usb.product.clone(),
            }),
            _ => None,
        })
        .collect())
}

#[command]
fn open(state: State<'_, SerialState>, path: String, baud_rate: u32) -> Result<(), String> {
    let mut handles = state.handles.lock().map_err(|err| err.to_string())?;
    if handles.contains_key(&path) {
        return Ok(());
    }
    let port = serialport::new(path.clone(), baud_rate)
        .open()
        .map_err(|err| err.to_string())?;
    handles.insert(path, port);

    Ok(())
}

#[command]
fn close(state: State<'_, SerialState>, path: String) -> Result<(), String> {
    let mut handles = state.handles.lock().map_err(|err| err.to_string())?;
    handles.remove(&path).ok_or("Port is already closed")?;

    Ok(())
}

#[command]
fn read(state: State<'_, SerialState>, path: String) -> Result<Vec<u8>, String> {
    let mut handles = state.handles.lock().map_err(|err| err.to_string())?;
    let port = handles.get_mut(&path).ok_or("Read: Port is not open")?;

    let size = port.bytes_to_read().map_err(|err| err.to_string())?;
    let mut buffer: Vec<u8> = vec![0; size as usize];
    port.read_exact(buffer.as_mut_slice())
        .map_err(|err| err.to_string())?;
    Ok(buffer)
}

#[command]
fn write(state: State<'_, SerialState>, path: String, chunk: Vec<u8>) -> Result<(), String> {
    let mut handles = state.handles.lock().map_err(|err| err.to_string())?;
    let port = handles.get_mut(&path).ok_or("Write: Port is not open")?;
    port.write_all(&chunk).map_err(|err| err.to_string())
}
