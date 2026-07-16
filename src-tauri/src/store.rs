// Imports
use serde::Serialize;
use std::collections::HashMap;

// Microsoft Store bridge (Rust side of src/services/PremiumServices.ts)
//
// The Store APIs are WinRT (Windows.Services.Store) and only answer when the
// app runs packaged (MSIX) with Store identity — unpackaged dev builds and
// non-Windows machines error out, which the frontend catches and treats as
// the free tier. The add-on IDs live in the frontend only and are passed in
// with every call (`addon_ids`: plan code -> Store ID or in-app offer token;
// both are accepted since add-ons are resolved from the app's own catalog).

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
    use windows::Foundation::Collections::IIterable;
    use windows::Services::Store::{StoreContext, StoreProduct, StorePurchaseStatus};
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
                // SkuStoreId looks like "9NBLGGH4TNMP/0010" — match the Store ID
                // prefix, or the in-app offer token when that's what's configured
                let sku = license.SkuStoreId().map_err(|e| e.to_string())?.to_string();
                let token = license
                    .InAppOfferToken()
                    .map_err(|e| e.to_string())?
                    .to_string();
                for (plan_code, addon_id) in addon_ids {
                    if (sku.starts_with(addon_id.as_str()) || token == *addon_id)
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

    // Enumerates the app's own add-on catalog and pairs each configured plan
    // with its StoreProduct, matching by Store ID or in-app offer token
    fn find_addon_products(
        context: &StoreContext,
        addon_ids: &HashMap<String, String>,
    ) -> Result<HashMap<String, StoreProduct>, String> {
        // Subscription and one-time add-ons both surface as "Durable" products
        let kinds: IIterable<HSTRING> = vec![HSTRING::from("Durable")].into();
        let result = context
            .GetAssociatedStoreProductsAsync(&kinds)
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;
        let products = result.Products().map_err(|e| e.to_string())?;

        let mut found: HashMap<String, StoreProduct> = HashMap::new();
        let iterator = products.First().map_err(|e| e.to_string())?;
        while iterator.HasCurrent().map_err(|e| e.to_string())? {
            let pair = iterator.Current().map_err(|e| e.to_string())?;
            let product = pair.Value().map_err(|e| e.to_string())?;
            let store_id = product.StoreId().map_err(|e| e.to_string())?.to_string();
            let token = product
                .InAppOfferToken()
                .map_err(|e| e.to_string())?
                .to_string();
            for (plan_code, addon_id) in addon_ids {
                if *addon_id == store_id || *addon_id == token {
                    found.insert(plan_code.clone(), product.clone());
                }
            }
            iterator.MoveNext().map_err(|e| e.to_string())?;
        }
        Ok(found)
    }

    // Queries the Store listing for the add-ons and returns the localized
    // formatted price per plan code (plans missing from the Store are omitted)
    pub fn fetch_plan_prices(
        addon_ids: &HashMap<String, String>,
    ) -> Result<HashMap<String, String>, String> {
        let context = StoreContext::GetDefault().map_err(|e| e.to_string())?;
        let mut prices: HashMap<String, String> = HashMap::new();
        for (plan_code, product) in find_addon_products(&context, addon_ids)? {
            let price = product
                .Price()
                .map_err(|e| e.to_string())?
                .FormattedPrice()
                .map_err(|e| e.to_string())?
                .to_string();
            prices.insert(plan_code, price);
        }
        Ok(prices)
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

        // Purchase through the resolved StoreProduct: passing a raw ID to
        // StoreContext.RequestPurchaseAsync makes the Store dialog fail with
        // PEX-CatalogAvailabilityDataNotFound when the ID isn't a resolvable
        // catalog Store ID (e.g. an in-app offer token)
        let plan_code = addon_ids
            .iter()
            .find(|(_, id)| id.as_str() == store_id)
            .map(|(plan, _)| plan.clone())
            .ok_or_else(|| format!("Unknown add-on ID {store_id}"))?;
        let product = find_addon_products(&context, addon_ids)?
            .remove(&plan_code)
            .ok_or_else(|| {
                format!(
                    "Add-on {store_id} not found in the Store catalog — check that the \
                     add-on is published and the ID matches its Store ID or offer token"
                )
            })?;

        let result = product
            .RequestPurchaseAsync()
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;

        match result.Status().map_err(|e| e.to_string())? {
            StorePurchaseStatus::Succeeded | StorePurchaseStatus::AlreadyPurchased => {
                resolve_license(addon_ids)
            }
            status => {
                let extended = result
                    .ExtendedError()
                    .map(|e| format!(", extended error {e:?}"))
                    .unwrap_or_default();
                Err(format!(
                    "Purchase did not complete (status {:?}{extended})",
                    status
                ))
            }
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

// Tauri command: live localized add-on prices keyed by plan code — errors
// whenever the Store is unreachable so the frontend falls back to static copy
#[tauri::command]
pub async fn get_premium_plan_prices(
    addon_ids: HashMap<String, String>,
) -> Result<HashMap<String, String>, String> {
    #[cfg(windows)]
    {
        // WinRT async `.get()` blocks — keep it off the main thread
        tauri::async_runtime::spawn_blocking(move || win::fetch_plan_prices(&addon_ids))
            .await
            .map_err(|e| e.to_string())?
    }
    #[cfg(not(windows))]
    {
        let _ = addon_ids;
        Err("Microsoft Store is unavailable on this platform".into())
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
