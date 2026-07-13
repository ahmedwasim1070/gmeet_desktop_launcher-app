// Imports
import { Crown, Loader2 } from "lucide-react";
import { ActionIconButton } from "../ui/ActionIconButton";
import { UsePremium } from "../../providers/PremiumProvider";

// Interface
interface PremiumStatusButtonProps {
	label?: string;
}

//
export const PremiumStatusButton = ({
	label = "Upgrade to Pro",
}: PremiumStatusButtonProps) => {
	// From Provider
	const {license, isPremium, isLicenseLoading, openPremiumPopup} = UsePremium();

	// License still resolving from the Store — show a neutral loading chip
	if (isLicenseLoading) {
		return (
			<span className="flex flex-row items-center gap-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold animate-pulse">
				<Loader2 className="w-4 h-4 animate-spin" />
				Checking Plan...
			</span>
		);
	}

	// Developer license (dev builds only) — stays clickable so the developer
	// can still open and test the premium plans popup
	if (license.plan === "developer") {
		return (
			<ActionIconButton
				label="Developer Premium"
				icon={<Crown />}
				onClick={openPremiumPopup}
			/>
		);
	}

	return (
		<>
			{isPremium ? (
				<span className="flex flex-row items-center gap-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold">
					<Crown className="w-4 h-4" />
					Premium User
				</span>
			) : (
				<ActionIconButton
					label={label}
					icon={<Crown />}
					onClick={openPremiumPopup}
				/>
			)}
		</>
	);
};
