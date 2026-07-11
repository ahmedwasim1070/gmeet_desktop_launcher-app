// Imports
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { PremiumLicense, PremiumPlanCode } from "../types";
import { useMeetClipboardWatcher } from "../hooks/useMeetClipboardWatcher";
import { fetchPremiumLicense, purchasePremiumPlan } from "./microsoftStore";
import { ClipboardMeetingPopup } from "../components/clipboard/ClipboardMeetingPopup";
import { PremiumPlansPopup } from "../components/premium/PremiumPlansPopup";

// AppServices
//
// Background services that run for the whole app lifetime:
//  1. Clipboard watcher — detects copied Google Meet links and offers to join.
//  2. Premium services — resolves the Microsoft Store license and handles
//     plan purchases (Rust-side Store commands pending, see Task.md).
//
// Wrap the app content with <AppServices> in App.tsx; any child can call
// usePremiumServices() to read the license or open the plans popup.

// Interfaces
interface PremiumServices {
	license: PremiumLicense;
	isPremium: boolean;
	openPremiumPopup: () => void;
	purchase: (plan: PremiumPlanCode) => Promise<void>;
}

interface AppServicesProps {
	children: ReactNode;
}

// Premium services context
const PremiumServicesContext = createContext<PremiumServices | null>(null);

export function usePremiumServices(): PremiumServices {
	const context = useContext(PremiumServicesContext);
	if (!context) {
		throw new Error("usePremiumServices must be used inside <AppServices>");
	}
	return context;
}

//
export function AppServices({ children }: AppServicesProps) {
	// States
	// Google Meet url detected on the clipboard
	const [clipboardMeetingUrl, setClipboardMeetingUrl] = useState<URL | null>(
		null,
	);
	// Microsoft Store license (free tier until the Store answers)
	const [license, setLicense] = useState<PremiumLicense>({
		isPremium: false,
		plan: "free",
	});
	// Premium plans popup visibility
	const [isPremiumPopupOpen, setIsPremiumPopupOpen] = useState<boolean>(false);

	// Clipboard watcher service
	const handleMeetUrlDetected = useCallback((url: URL) => {
		setClipboardMeetingUrl(url);
	}, []);
	useMeetClipboardWatcher(handleMeetUrlDetected);

	// Resolve the Store license once on startup
	useEffect(() => {
		fetchPremiumLicense().then(setLicense);
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

	return (
		<PremiumServicesContext.Provider
			value={{
				license,
				isPremium: license.isPremium,
				openPremiumPopup,
				purchase,
			}}
		>
			{/* Clipboard Meeting Popup */}
			{clipboardMeetingUrl && (
				<ClipboardMeetingPopup
					meetingUrl={clipboardMeetingUrl}
					onClose={() => setClipboardMeetingUrl(null)}
				/>
			)}

			{/* Premium Plans Popup */}
			{isPremiumPopupOpen && (
				<PremiumPlansPopup
					onClose={() => setIsPremiumPopupOpen(false)}
					onPurchase={purchase}
				/>
			)}

			{children}
		</PremiumServicesContext.Provider>
	);
}
