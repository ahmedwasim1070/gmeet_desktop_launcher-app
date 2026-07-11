// Imports
import type { ReactNode } from "react";
import { CloseButton } from "./CloseButton";

// Interface
interface PopupProps {
	onClose: () => void;
	children: ReactNode;
	className?: string;
}

//
export function Popup({ onClose, children, className = "" }: PopupProps) {
	return (
		<section
			onClick={onClose}
			className="fixed inset-0 z-40 bg-text-primary/30 flex justify-center items-center"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className={`bg-bg-surface shadow-sm rounded-lg w-110 max-h-[90vh] overflow-y-auto scrollbar-hidden relative flex flex-col p-6 ${className}`}
			>
				{/* Close btn */}
				<CloseButton onClick={onClose} />
				{children}
			</div>
		</section>
	);
}