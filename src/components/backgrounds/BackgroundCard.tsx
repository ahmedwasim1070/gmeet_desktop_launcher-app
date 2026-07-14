// Imports
import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { PremiumStatusButton } from "../premium/PremiumStatusButton";
import { UsePremium } from "../../providers/PremiumProvider";
import { invoke } from "@tauri-apps/api/core";

// Interface
interface BackgroundCardProps {
	imageLocation: string;
	// Small preview shown in the card — the full-size image is only fetched on download
	previewLocation: string;
	imageDescription: string;
}

// Card for a single downloadable virtual background
export const BackgroundCard = ({
	imageLocation,
	previewLocation,
	imageDescription,
}: BackgroundCardProps) => {
	// From Provider
	const { isPremium } = UsePremium();
	// States
	// Download progress
	const [downloadState, setDownloadState] = useState<
		"idle" | "saving" | "saved"
	>("idle");

	// Saves the background into the user's Downloads folder
	const handleDownload = async () => {
		if (downloadState === "saving") return;
		setDownloadState("saving");
		try {
			// 1. Extract just the file name (e.g., "bg-1.jpg" from "/backgrounds/bg-1.jpg")
			const fileName = imageLocation.split("/").pop() || "background.jpg";

			// 2. Fetch the image directly from Vite/Tauri's local web server
			const response = await fetch(imageLocation);
			const blob = await response.blob();
			const arrayBuffer = await blob.arrayBuffer();

			// 3. Convert ArrayBuffer to a standard number array for Tauri IPC
			const fileBytes = Array.from(new Uint8Array(arrayBuffer));

			// 4. Send the clean file name and bytes to Rust!
			await invoke<string>("save_background", {
				fileName: fileName,
				fileBytes: fileBytes,
			});

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
					src={previewLocation}
					alt={imageDescription}
					loading="lazy"
					decoding="async"
					draggable={false}
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
