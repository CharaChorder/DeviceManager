// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod serial;

fn main() {
    tauri::Builder::default()
        .plugin(serial::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
