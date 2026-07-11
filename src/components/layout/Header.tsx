// Imports
import { Dispatch, SetStateAction } from "react";
import { PremiumStatusButton } from "../premium/PremiumStatusButton";
import { SettingsButton } from "../settings/SettingsButton";

// Interface
interface HeaderProps {
	setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
}

//
export const Header = ({ setIsSettingsOpen }: HeaderProps) => {
	return (
		<section className="flex flex-row items-center justify-between mb-4">
			<PremiumStatusButton />
			<SettingsButton setIsSettingsOpen={setIsSettingsOpen} />
		</section>
	);
};
