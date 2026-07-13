// Imports
import { invoke } from "@tauri-apps/api/core";

// Background downloads
//
// Frontend side of the virtual background download. The `save_background`
// Tauri command (src-tauri/src/backgrounds.rs) copies the bundled image from
// public/backgrounds into the user's Downloads folder and returns the saved
// path. Bundled assets are only resolvable in packaged builds, so dev builds
// reject with an error the caller should surface gracefully.
export async function downloadBackground(fileName: string): Promise<string> {
  return await invoke<string>("save_background", { fileName });
}
