// Modules
mod backgrounds;
mod store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            store::get_premium_license,
            store::purchase_premium_plan,
            backgrounds::save_background
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
