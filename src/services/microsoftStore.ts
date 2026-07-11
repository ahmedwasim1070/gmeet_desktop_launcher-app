// Imports
import { invoke } from "@tauri-apps/api/core";
import type { PremiumLicense, PremiumPlanCode } from "../types";

// Microsoft Store bridge
//
// Frontend side of the in-app purchase flow. The actual Store calls run in
// Rust (Windows.Services.Store via the `windows` crate) behind two Tauri
// commands that are NOT implemented yet — the full setup plan lives in
// Task.md at the repo root. Until those commands exist, every function here
// degrades gracefully to the free tier so the app keeps working in dev and
// on non-Windows machines.

// Add-on Store IDs from Partner Center (Task.md → Phase 1).
// Replace the placeholders once the add-ons are created.
const STORE_ADDON_IDS: Record<PremiumPlanCode, string> = {
  annual: "TODO_PARTNER_CENTER_ANNUAL_ADDON_STORE_ID",
  lifetime: "TODO_PARTNER_CENTER_LIFETIME_ADDON_STORE_ID",
};

const FREE_LICENSE: PremiumLicense = { isPremium: false, plan: "free" };

// Reads the current license from the Microsoft Store.
export async function fetchPremiumLicense(): Promise<PremiumLicense> {
  try {
    return await invoke<PremiumLicense>("get_premium_license");
  } catch {
    // Rust command not implemented yet (see Task.md) — treat as free tier.
    return FREE_LICENSE;
  }
}

// Starts the Microsoft Store purchase dialog for the given plan and
// returns the refreshed license.
export async function purchasePremiumPlan(
  plan: PremiumPlanCode,
): Promise<PremiumLicense> {
  try {
    return await invoke<PremiumLicense>("purchase_premium_plan", {
      storeId: STORE_ADDON_IDS[plan],
    });
  } catch (err) {
    console.error("Error in purchasePremiumPlan (see Task.md):", err);
    return FREE_LICENSE;
  }
}
