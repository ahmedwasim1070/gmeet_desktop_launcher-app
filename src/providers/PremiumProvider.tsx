// Import
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PremiumLicense, PremiumPlanCode } from "../types";
import { fetchPremiumLicense, purchasePremiumPlan } from "../services/microsoftStore";

// Interface
interface PremiumProvidedProps {
	license: PremiumLicense;
	isPremium: boolean;
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
	// Premium plans popup visibility
	const [isPremiumPopupOpen, setIsPremiumPopupOpen] = useState<boolean>(false);

	// Resolve the Store license once on startup
	useEffect(() => {
		let cancelled = false;
		fetchPremiumLicense().then((resolved) => {
			if (!cancelled) setLicense(resolved);
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
		isPremiumPopupOpen,
		openPremiumPopup,
		closePremiumPopup,
		purchase,
	}),[license, isPremiumPopupOpen, openPremiumPopup, closePremiumPopup, purchase])

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