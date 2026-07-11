// Imports
import { X } from "lucide-react";

// interface
interface CloseButtonProps {
	onClick: () => void;
}

//
export const CloseButton = ({ onClick }: CloseButtonProps) => {
	return (
		<button
			onClick={onClick}
			className="p-1.5 bg-bg-base rounded-full absolute right-3 top-3 cursor-pointer text-text-muted hover:text-red-500 transition-colors"
		>
			<X className="w-4 h-4" />
		</button>
	);
};
