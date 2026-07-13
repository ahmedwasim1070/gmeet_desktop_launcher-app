// Imports
use tauri::Manager;

// Background downloads (Rust side of src/services/backgrounds.ts)

// Tauri command: saves a bundled background image (public/backgrounds) into
// the user's Downloads folder and returns the destination path
#[tauri::command]
pub async fn save_background(
    app: tauri::AppHandle, 
    file_name: String, 
    file_bytes: Vec<u8>
) -> Result<String, String> {
    // 1. Strict security check against path traversal
    if file_name.is_empty() || file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return Err("Invalid file name".into());
    }

    // 2. Get the OS Downloads directory
    let downloads_dir = app.path().download_dir().map_err(|e| e.to_string())?;
    
    // 3. Create the full destination path
    let destination = downloads_dir.join(&file_name);
    
    // 4. Write the raw bytes directly to disk
    std::fs::write(&destination, &file_bytes).map_err(|e| e.to_string())?;

    Ok(destination.display().to_string())
}
