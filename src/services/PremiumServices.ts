// Imports
import { invoke } from "@tauri-apps/api/core";
import type { PremiumLicense, PremiumPlan, PremiumPlanCode } from "../types";

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

// Plan copy with fallback prices — used when the Store can't answer
// (dev builds, offline, unpackaged). Live Store prices override these.
const FALLBACK_PLANS: PremiumPlan[] = [
	{
		planCode: "annual",
		label: "Annual Plan",
		slogan: "Once In a Year",
		price: "4.99 $",
	},
	{
		planCode: "lifetime",
		label: "LifeTime Plan",
		slogan: "One Time Only",
		price: "19.99 $",
	},
];

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

// Resolves the purchasable plans, with live localized prices from the
// Microsoft Store when available.
export async function fetchPremiumPlans(): Promise<PremiumPlan[]> {
	if (IS_DEV_PREMIUM) return FALLBACK_PLANS;
	try {
		const prices = await invoke<Partial<Record<PremiumPlanCode, string>>>(
			"get_premium_plan_prices",
			{ addonIds: STORE_ADDON_IDS },
		);
		return FALLBACK_PLANS.map((plan) => ({
			...plan,
			price: prices[plan.planCode] ?? plan.price,
		}));
	} catch {
		// On fail - return the static fallback copy
		return FALLBACK_PLANS;
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
