// Imports
import { Crown } from "lucide-react";
import { ActionIconButton } from "../ui/ActionIconButton";
import { UsePremium } from "../../providers/PremiumProvider";

//
export const PremiumStatusButton = () => {
	// From Provider
	const {isPremium,openPremiumPopup} = UsePremium();

	return (
		<>
			{isPremium ? (
				<span className="flex flex-row items-center gap-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold">
					<Crown className="w-4 h-4" />
					Premium User
				</span>
			) : (
				<ActionIconButton
					label="Upgrade to Pro"
					icon={<Crown />}
					onClick={openPremiumPopup}
				/>
			)}
		</>
	);
};
