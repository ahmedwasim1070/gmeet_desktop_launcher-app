// Imports
import { Settings } from "lucide-react";

// Interface
interface SettingsProps {
	setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
}

//
export const SettingsButton = ({ setIsSettingsOpen }: SettingsProps) => {
	return (
		<button
			onClick={() => setIsSettingsOpen(true)}
			className="p-2 rounded-full text-text-muted cursor-pointer hover:bg-bg-surface hover:text-text-primary transition-colors"
		>
			<Settings className="w-5 h-5" />
		</button>
	);
};
