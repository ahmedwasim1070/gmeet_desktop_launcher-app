// Import
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PremiumLicense, PremiumPlanCode } from "../types";
import { fetchPremiumLicense, purchasePremiumPlan } from "../services/PremiumServices";

// Interface
interface PremiumProvidedProps {
	license: PremiumLicense;
	isPremium: boolean;
	isLicenseLoading: boolean;
	isPremiumPopupOpen: boolean;
	openPremiumPopup: () => void;
	closePremiumPopup: () => void;
	purchase: (plan: PremiumPlanCode) => Promise<void>;
}
interface PremiumProviderProps {
	children: ReactNode;
}

//
const PremiumProviderContext = createContext<PremiumProvidedProps | undefined>(undefined);

//
export default function PremiumProvider({children}:PremiumProviderProps) {
	// Microsoft Store license (free tier until the Store answers)
	const [license, setLicense] = useState<PremiumLicense>({
		isPremium: false,
		plan: "free",
	});
	// License resolution in flight (true until the Store answers)
	const [isLicenseLoading, setIsLicenseLoading] = useState<boolean>(true);
	// Premium plans popup visibility
	const [isPremiumPopupOpen, setIsPremiumPopupOpen] = useState<boolean>(false);

	// Resolve the Store license once on startup
	useEffect(() => {
		let cancelled = false;
		fetchPremiumLicense().then((resolved) => {
			if (cancelled) return;
			setLicense(resolved);
			setIsLicenseLoading(false);
			// Pitch the premium plans once per launch to free users
			if (!resolved.isPremium) setIsPremiumPopupOpen(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Purchase a plan through the Microsoft Store and refresh the license
	const purchase = useCallback(async (plan: PremiumPlanCode) => {
		const updatedLicense = await purchasePremiumPlan(plan);
		setLicense(updatedLicense);
		if (updatedLicense.isPremium) {
			setIsPremiumPopupOpen(false);
		}
	}, []);
	const openPremiumPopup = useCallback(() => setIsPremiumPopupOpen(true), []);
	const closePremiumPopup = useCallback(() => setIsPremiumPopupOpen(false), []);

	//
	const values = useMemo(()=>({
		license,
		isPremium: license.isPremium,
		isLicenseLoading,
		isPremiumPopupOpen,
		openPremiumPopup,
		closePremiumPopup,
		purchase,
	}),[license, isLicenseLoading, isPremiumPopupOpen, openPremiumPopup, closePremiumPopup, purchase])

	return(
		<PremiumProviderContext.Provider value={values}>
			{/*  */}
			{children}
		</PremiumProviderContext.Provider>
	)
}

//
export function UsePremium(){
	const context = useContext(PremiumProviderContext);
	if (!context) {
		throw new Error("UsePremium must be used inside <PremiumProvider>");
	}
	return context;
};