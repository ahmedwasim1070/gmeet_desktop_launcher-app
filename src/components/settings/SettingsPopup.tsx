// Imports
import {
	ArrowUpRight,
	Crown,
	FileText,
	Hand,
	Mail,
	Star,
	X,
} from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { usePremiumServices } from "../../services/AppServices";
import { CloseButton } from "../ui/CloseButton";

// Interface
interface SettingsPopupProps {
	onClose: () => void;
}

// Support & legal destinations — leave url empty to show "Coming soon"
const SUPPORT_EMAIL = ""; // TODO: set the support email address
const SUPPORT_LINKS = [
	{
		label: "Rate G-Meet Launcher",
		icon: <Star className="w-4 h-4" />,
		value: "",
		url: "ms-windows-store://review/?ProductId=9PHKS01R0C0B",
	},
	{
		label: "Contact support",
		icon: <Mail className="w-4 h-4" />,
		value: SUPPORT_EMAIL,
		url: SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : "",
	},
	{
		label: "Terms of Service",
		icon: <FileText className="w-4 h-4" />,
		value: "",
		url: "", // TODO: terms of service page
	},
	{
		label: "Privacy Policy",
		icon: <Hand className="w-4 h-4" />,
		value: "",
		url: "", // TODO: privacy policy page
	},
];

// Settings popup — plan overview plus support & legal links
export function SettingsPopup({ onClose }: SettingsPopupProps) {
	const { license, isPremium, openPremiumPopup } = usePremiumServices();

	const userName = localStorage.getItem("userName") || "User";

	const handleLinkOpen = async (url: string) => {
		if (!url) return;
		try {
			await openUrl(url);
		} catch (err) {
			console.error("Error opening link from SettingsPopup:", err);
		}
	};

	return (
		<section
			onClick={onClose}
			className="inset-0 fixed z-40 min-w-screen h-full bg-text-primary/30 flex justify-center items-center"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-bg-surface shadow-sm rounded-lg w-[440px] max-h-[90vh] overflow-y-auto hide-scrollbar relative flex flex-col p-6 gap-y-6"
			>
				{/* Close btn */}
				<CloseButton onClick={onClose} />

				{/* Title */}
				<h2 className="font-semibold text-lg text-text-primary">Settings</h2>

				{/* Your Plan */}
				<div className="space-y-2">
					<p className="text-xs font-semibold tracking-widest uppercase text-text-muted">
						Your Plan
					</p>

					<div className="bg-bg-elevated border border-border/15 rounded-xl p-4">
						{/* User row */}
						<div className="flex flex-row items-center justify-between">
							<div className="flex flex-row items-center gap-x-3">
								{/* Avatar with the user's initial */}
								<div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue font-bold flex items-center justify-center">
									{userName.charAt(0).toUpperCase()}
								</div>
								<p className="font-semibold text-text-primary">{userName}</p>
							</div>

							{/* Plan badge */}
							<span
								className={`text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
									isPremium
										? "bg-brand-blue text-white"
										: "bg-bg-base text-text-muted"
								}`}
							>
								{isPremium ? license.plan : "Free"}
							</span>
						</div>

						<hr className="border-border/15 my-3" />

						{/* Plan row */}
						<div className="flex flex-row items-center justify-between">
							<p className="text-sm text-text-primary">
								{isPremium
									? "You're on the premium plan."
									: "You're on the free plan."}
							</p>
							{!isPremium && (
								<button
									onClick={openPremiumPopup}
									className="flex flex-row items-center gap-x-1.5 text-sm font-semibold text-brand-blue cursor-pointer hover:underline"
								>
									<Crown className="w-4 h-4" />
									Upgrade to Pro
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Support & Legal */}
				<div className="space-y-2">
					<p className="text-xs font-semibold tracking-widest uppercase text-text-muted">
						Support &amp; Legal
					</p>

					<div className="bg-bg-elevated border border-border/15 rounded-xl overflow-hidden">
						{SUPPORT_LINKS.map((link, idx) => {
							const isAvailable = link.url.length > 0;
							return (
								<button
									key={link.label}
									onClick={() => handleLinkOpen(link.url)}
									disabled={!isAvailable}
									className={`w-full flex flex-row items-center justify-between p-4 text-left transition-colors ${
										idx !== SUPPORT_LINKS.length - 1
											? "border-b border-border/15"
											: ""
									} ${
										isAvailable
											? "cursor-pointer hover:bg-bg-base text-text-primary"
											: "cursor-not-allowed text-text-muted/60"
									}`}
								>
									<span className="flex flex-row items-center gap-x-3">
										{link.icon}
										<span className="text-sm font-medium">{link.label}</span>
									</span>
									<span className="flex flex-row items-center gap-x-2 text-sm text-text-muted">
										{isAvailable ? link.value : "Coming soon"}
										<ArrowUpRight className="w-4 h-4" />
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* App info */}
				<div className="text-xs text-text-muted space-y-0.5">
					<p>G-Meet Desktop Launcher 1.0.0</p>
					<p>Not affiliated with Google.</p>
				</div>
			</div>
		</section>
	);
}
