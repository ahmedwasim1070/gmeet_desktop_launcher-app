// Imports
use serde::Serialize;
use std::collections::HashMap;

// Microsoft Store bridge (Rust side of src/services/PremiumServices.ts)
//
// The Store APIs are WinRT (Windows.Services.Store) and only answer when the
// app runs packaged (MSIX) with Store identity — unpackaged dev builds and
// non-Windows machines error out, which the frontend catches and treats as
// the free tier. The add-on Store IDs live in the frontend only and are
// passed in with every call (`addon_ids`: plan code -> Store ID).

// License state returned to the frontend — must mirror `PremiumLicense`
// in src/types/index.ts
#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PremiumLicense {
    pub is_premium: bool,
    pub plan: String,
}

impl PremiumLicense {
    fn free() -> Self {
        Self {
            is_premium: false,
            plan: "free".into(),
        }
    }
}

// Windows-only implementation against Windows.Services.Store
#[cfg(windows)]
mod win {
    use super::PremiumLicense;
    use std::collections::HashMap;
    use windows::core::{Interface, HSTRING};
    use windows::Services::Store::{StoreContext, StorePurchaseStatus};
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Shell::IInitializeWithWindow;

    // Reads the app license and maps the active add-ons onto a plan code
    pub fn resolve_license(
        addon_ids: &HashMap<String, String>,
    ) -> Result<PremiumLicense, String> {
        let context = StoreContext::GetDefault().map_err(|e| e.to_string())?;
        let app_license = context
            .GetAppLicenseAsync()
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;
        let addon_licenses = app_license.AddOnLicenses().map_err(|e| e.to_string())?;

        // Walk the add-on licenses; lifetime outranks annual when both are active
        let mut active_plan: Option<String> = None;
        let iterator = addon_licenses.First().map_err(|e| e.to_string())?;
        while iterator.HasCurrent().map_err(|e| e.to_string())? {
            let pair = iterator.Current().map_err(|e| e.to_string())?;
            let license = pair.Value().map_err(|e| e.to_string())?;
            if license.IsActive().map_err(|e| e.to_string())? {
                // SkuStoreId looks like "9NBLGGH4TNMP/0010" — match on the Store ID prefix
                let sku = license.SkuStoreId().map_err(|e| e.to_string())?.to_string();
                for (plan_code, store_id) in addon_ids {
                    if sku.starts_with(store_id.as_str())
                        && (active_plan.is_none() || plan_code == "lifetime")
                    {
                        active_plan = Some(plan_code.clone());
                    }
                }
            }
            iterator.MoveNext().map_err(|e| e.to_string())?;
        }

        match active_plan {
            Some(plan) => Ok(PremiumLicense {
                is_premium: true,
                plan,
            }),
            None => Ok(PremiumLicense::free()),
        }
    }

    // Shows the Store purchase dialog for the add-on and re-reads the license
    pub fn purchase(
        hwnd: isize,
        store_id: &str,
        addon_ids: &HashMap<String, String>,
    ) -> Result<PremiumLicense, String> {
        let context = StoreContext::GetDefault().map_err(|e| e.to_string())?;

        // Desktop apps must anchor the purchase dialog to the window
        // (IInitializeWithWindow) or RequestPurchaseAsync cannot show UI
        let init: IInitializeWithWindow = context.cast().map_err(|e| e.to_string())?;
        unsafe { init.Initialize(HWND(hwnd as *mut core::ffi::c_void)) }
            .map_err(|e| e.to_string())?;

        let result = context
            .RequestPurchaseAsync(&HSTRING::from(store_id))
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;

        match result.Status().map_err(|e| e.to_string())? {
            StorePurchaseStatus::Succeeded | StorePurchaseStatus::AlreadyPurchased => {
                resolve_license(addon_ids)
            }
            status => Err(format!("Purchase did not complete (status {:?})", status)),
        }
    }
}

// Tauri command: current license — free tier whenever the Store is unreachable
#[tauri::command]
pub async fn get_premium_license(
    addon_ids: HashMap<String, String>,
) -> Result<PremiumLicense, String> {
    #[cfg(windows)]
    {
        // WinRT async `.get()` blocks — keep it off the main thread
        tauri::async_runtime::spawn_blocking(move || win::resolve_license(&addon_ids))
            .await
            .map_err(|e| e.to_string())?
    }
    #[cfg(not(windows))]
    {
        let _ = addon_ids;
        Ok(PremiumLicense::free())
    }
}

// Tauri command: purchase an add-on and return the refreshed license
#[tauri::command]
pub async fn purchase_premium_plan(
    window: tauri::Window,
    store_id: String,
    addon_ids: HashMap<String, String>,
) -> Result<PremiumLicense, String> {
    #[cfg(windows)]
    {
        // Raw HWND as isize so it can cross into the blocking thread
        let hwnd = window.hwnd().map_err(|e| e.to_string())?.0 as isize;
        tauri::async_runtime::spawn_blocking(move || win::purchase(hwnd, &store_id, &addon_ids))
            .await
            .map_err(|e| e.to_string())?
    }
    #[cfg(not(windows))]
    {
        let _ = (window, store_id, addon_ids);
        Ok(PremiumLicense::free())
    }
}
