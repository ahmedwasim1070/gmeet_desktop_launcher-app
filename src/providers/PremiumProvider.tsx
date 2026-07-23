// Import
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { PremiumLicense, PremiumPlan, PremiumPlanCode } from "../types";
import {
	fetchPremiumLicense,
	fetchPremiumPlans,
	purchasePremiumPlan,
} from "../services/PremiumServices";

// Interface
interface PremiumProvidedProps {
	license: PremiumLicense;
	isPremium: boolean;
	isLicenseLoading: boolean;
	plans: PremiumPlan[];
	arePlansLoading: boolean;
	isPurchasing: boolean;
	isPremiumPopupOpen: boolean;
	openPremiumPopup: () => void;
	closePremiumPopup: () => void;
	purchase: (plan: PremiumPlanCode) => Promise<void>;
}
interface PremiumProviderProps {
	children: ReactNode;
}

//
const PremiumProviderContext = createContext<PremiumProvidedProps | undefined>(
	undefined,
);

//
export default function PremiumProvider({ children }: PremiumProviderProps) {
	// Microsoft Store license (free tier until the Store answers)
	const [license, setLicense] = useState<PremiumLicense>({
		isPremium: false,
		plan: "free",
	});
	// License resolution in flight (true until the Store answers)
	const [isLicenseLoading, setIsLicenseLoading] = useState<boolean>(true);
	// Purchasable plans, resolved live from the Store on startup
	const [plans, setPlans] = useState<PremiumPlan[]>([]);
	// Plans resolution in flight (true until the Store answers)
	const [arePlansLoading, setArePlansLoading] = useState<boolean>(true);
	// Purchase in flight
	const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
	// Premium plans popup visibility
	const [isPremiumPopupOpen, setIsPremiumPopupOpen] = useState<boolean>(false);

	// Resolve the Store license and the live plans once on startup
	useEffect(() => {
		let cancelled = false;
		fetchPremiumLicense().then((resolved) => {
			if (cancelled) return;
			setLicense(resolved);
			setIsLicenseLoading(false);
			// Pitch the premium plans once per launch to free users
			if (!resolved.isPremium) setIsPremiumPopupOpen(true);
		});
		fetchPremiumPlans().then((resolved) => {
			if (cancelled) return;
			setPlans(resolved);
			setArePlansLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Purchase a plan through the Microsoft Store and refresh the license
	const purchase = useCallback(async (plan: PremiumPlanCode) => {
		setIsPurchasing(true);
		try {
			const updatedLicense = await purchasePremiumPlan(plan);
			setLicense(updatedLicense);
			if (updatedLicense.isPremium) {
				setIsPremiumPopupOpen(false);
			}
		} finally {
			setIsPurchasing(false);
		}
	}, []);
	const openPremiumPopup = useCallback(() => setIsPremiumPopupOpen(true), []);
	const closePremiumPopup = useCallback(() => setIsPremiumPopupOpen(false), []);

	//
	const values = useMemo(
		() => ({
			license,
			isPremium: license.isPremium,
			isLicenseLoading,
			plans,
			arePlansLoading,
			isPurchasing,
			isPremiumPopupOpen,
			openPremiumPopup,
			closePremiumPopup,
			purchase,
		}),
		[
			license,
			isLicenseLoading,
			plans,
			arePlansLoading,
			isPurchasing,
			isPremiumPopupOpen,
			openPremiumPopup,
			closePremiumPopup,
			purchase,
		],
	);

	return (
		<PremiumProviderContext.Provider value={values}>
			{/*  */}
			{children}
		</PremiumProviderContext.Provider>
	);
}

//
export function UsePremium() {
	const context = useContext(PremiumProviderContext);
	if (!context) {
		throw new Error("UsePremium must be used inside <PremiumProvider>");
	}
	return context;
}
