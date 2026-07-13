// Imports
use tauri::Manager;

// Background downloads (Rust side of src/services/backgrounds.ts)

// Tauri command: saves a bundled background image (public/backgrounds) into
// the user's Downloads folder and returns the destination path
#[tauri::command]
pub async fn save_background(app: tauri::AppHandle, file_name: String) -> Result<String, String> {
    // Only allow plain file names — no path traversal
    if file_name.is_empty() || file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return Err("Invalid background file name".into());
    }

    // Bundled frontend assets are embedded in the binary; dev builds serve
    // them from the dev server instead, so the resolver can come up empty
    let asset = app
        .asset_resolver()
        .get(format!("/backgrounds/{file_name}"))
        .ok_or("Background asset not found (unavailable in dev builds)")?;

    let downloads_dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let destination = downloads_dir.join(&file_name);
    std::fs::write(&destination, &asset.bytes).map_err(|e| e.to_string())?;

    Ok(destination.display().to_string())
}
