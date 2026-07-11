// Imports
import { PremiumStatusButton } from "../premium/PremiumStatusButton";
import { SettingsButton } from "../settings/SettingsButton";
import { UseApp } from "../../providers/AppProvider";

//
export const Header = () => {
	// providers
	const {setIsSettingsOpen} = UseApp();

	return (
		<section className="flex flex-row items-center justify-between mb-4">
			<PremiumStatusButton />
			<SettingsButton setIsSettingsOpen={setIsSettingsOpen} />
		</section>
	);
};
