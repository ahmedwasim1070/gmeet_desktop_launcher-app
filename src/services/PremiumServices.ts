// Imports
import { invoke } from "@tauri-apps/api/core";
import type { PremiumLicense, PremiumPlanCode } from "../types";

// Premium services (Microsoft Store bridge)
//
// Frontend side of the in-app purchase flow. The actual Store calls run in
// Rust (Windows.Services.Store via the `windows` crate) behind the
// `get_premium_license` / `purchase_premium_plan` Tauri commands in
// src-tauri/src/store.rs. The Store only answers when the app runs packaged
// (MSIX) with Store identity — unpackaged dev builds and non-Windows machines
// degrade gracefully to the free tier so the app keeps working everywhere.

// Add-on Store IDs from Partner Center (Task.md → Phase 1).
// Replace the placeholders once the add-ons are created.
const STORE_ADDON_IDS: Record<PremiumPlanCode, string> = {
  annual: "GMeetDesktopLauncherAnnual",
  lifetime: "GMeetDesktopLauncherLifetime",
};

const FREE_LICENSE: PremiumLicense = { isPremium: false, plan: "free" };
const DEVELOPER_LICENSE: PremiumLicense = { isPremium: true, plan: "developer" };

// Developer license — unlocks premium locally for testing. Two independent
// locks so a shipped build can never grant it:
//   1. VITE_APP_ENVIRONMENT must be DEVELOPMENT — baked into the bundle at
//      build time from .env (end users can't toggle it after the build), and
//      .env.production pins PRODUCTION for every `npm run build`.
//   2. The bundle itself must be a dev build (`import.meta.env.DEV`) — a
//      release bundle ignores the variable entirely, even if it slipped
//      through as DEVELOPMENT.
const IS_DEV_PREMIUM =
  import.meta.env.DEV &&
  import.meta.env.VITE_APP_ENVIRONMENT === "DEVELOPMENT";

// Reads the current license from the Microsoft Store.
export async function fetchPremiumLicense(): Promise<PremiumLicense> {
  if (IS_DEV_PREMIUM) return DEVELOPER_LICENSE;
  try {
    return await invoke<PremiumLicense>("get_premium_license", {
      addonIds: STORE_ADDON_IDS,
    });
  } catch {
    // Store unreachable (dev build without Store identity) — treat as free tier.
    return FREE_LICENSE;
  }
}

// Starts the Microsoft Store purchase dialog for the given plan and
// returns the refreshed license.
export async function purchasePremiumPlan(
  plan: PremiumPlanCode,
): Promise<PremiumLicense> {
  if (IS_DEV_PREMIUM) return DEVELOPER_LICENSE;
  try {
    return await invoke<PremiumLicense>("purchase_premium_plan", {
      storeId: STORE_ADDON_IDS[plan],
      addonIds: STORE_ADDON_IDS,
    });
  } catch (err) {
    console.error("Error in purchasePremiumPlan:", err);
    // Purchase failed or was cancelled — fall back to whatever the Store says now.
    return fetchPremiumLicense();
  }
}
