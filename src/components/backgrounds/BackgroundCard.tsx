// Imports
import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { downloadBackground } from "../../services/backgrounds";
import { PremiumStatusButton } from "../premium/PremiumStatusButton";
import { UsePremium } from "../../providers/PremiumProvider";

// Interface
interface BackgroundCardProps {
	imageLocation: string;
	imageDescription: string;
}

// Card for a single downloadable virtual background
export const BackgroundCard = ({
	imageLocation,
	imageDescription,
}: BackgroundCardProps) => {
	// From Provider
	const {isPremium} = UsePremium();
	// States
	// Download progress
	const [downloadState, setDownloadState] = useState<"idle" | "saving" | "saved">("idle");

	// Saves the background into the user's Downloads folder
	const handleDownload = async () => {
		if (downloadState === "saving") return;
		setDownloadState("saving");
		try {
			await downloadBackground(imageLocation.split("/").pop() ?? "");
			setDownloadState("saved");
		} catch (err) {
			console.error("Error in handleDownload:", err);
			setDownloadState("idle");
		}
	};

	return (
		<div className="w-[320px] shrink-0 bg-bg-surface rounded-xl p-3 relative border border-border/15 shadow-sm transition-all hover:shadow-md">
			{/* Image Preview */}
			<div className="relative rounded-lg overflow-hidden">
				<img
					src={imageLocation}
					alt={imageDescription}
					className="w-full h-44 object-cover pointer-events-none"
				/>

				{isPremium ? (
					/* Download Button — icon only, top right of the preview */
					<button
						onClick={handleDownload}
						title="Download"
						className="absolute top-2 right-2 p-2 bg-bg-surface/80 backdrop-blur-sm text-text-primary rounded-full cursor-pointer hover:bg-brand-blue hover:text-white active:scale-95 transition-all"
					>
						{downloadState === "saving" ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : downloadState === "saved" ? (
							<Check className="w-5 h-5" />
						) : (
							<Download className="w-5 h-5" />
						)}
					</button>
				) : (
					/* Premium Gate Overlay */
					<div className="absolute inset-0 bg-text-primary/30 backdrop-blur-[2px] flex items-center justify-center">
						<PremiumStatusButton label="Premium Feature" />
					</div>
				)}
			</div>
		</div>
	);
};
