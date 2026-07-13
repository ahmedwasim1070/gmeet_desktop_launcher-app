// Imports
import { invoke } from "@tauri-apps/api/core";
import type { PremiumLicense, PremiumPlanCode } from "../types";

// Add On's ID's
const STORE_ADDON_IDS: Record<PremiumPlanCode, string> = {
	annual: "GMeetDesktopLauncherAnnual",
	lifetime: "GMeetDesktopLauncherLifetime",
};

// Payloads
const FREE_LICENSE: PremiumLicense = { isPremium: false, plan: "free" };
const DEVELOPER_LICENSE: PremiumLicense = {
	isPremium: true,
	plan: "developer",
};

// Import ENV
const IS_DEV_PREMIUM =
	import.meta.env.DEV && import.meta.env.VITE_APP_ENVIRONMENT === "DEVELOPMENT";

// Reads the current license from the Microsoft Store.
export async function fetchPremiumLicense(): Promise<PremiumLicense> {
	if (IS_DEV_PREMIUM) return DEVELOPER_LICENSE;
	try {
		return await invoke<PremiumLicense>("get_premium_license", {
			addonIds: STORE_ADDON_IDS,
		});
	} catch {
		// On fail - return default (Free)
		return FREE_LICENSE;
	}
}

// Init In-App-Purchase via Microsoft
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
		// On fail- verify subscription status
		return fetchPremiumLicense();
	}
}
