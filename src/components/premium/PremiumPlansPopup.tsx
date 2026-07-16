// Imports
import { useState } from "react";
import {
	BellRing,
	CalendarDays,
	Headset,
	ShieldCheck,
	Wallpaper,
} from "lucide-react";
import type { PremiumPlanCode } from "../../types";
import { SUPPORT_LINKS } from "../../constants";
import { CloseButton } from "../ui/CloseButton";
import GoogleMeetLogoSvg from "../../assets/g_meet-logo.svg";
import { openUrl } from "@tauri-apps/plugin-opener";
import { UsePremium } from "../../providers/PremiumProvider";

// Interface
interface PremiumPlansPopupProps {
	onClose: () => void;
}

//
export function PremiumPlansPopup({ onClose }: PremiumPlansPopupProps) {
	const { plans, arePlansLoading, isPurchasing, purchase } = UsePremium();
	// States
	// Selected Plan
	const [selectedPlan, setSelectedPlan] = useState<PremiumPlanCode>("annual");
	// Featured — must match what the license actually unlocks
	const featuredItems = [
		{
			label: "Virtual Backgrounds",
			icon: <Wallpaper size={20} />,
		},
		{
			label: "Schedule Meetings",
			icon: <CalendarDays size={20} />,
		},
		{
			label: "Meeting Reminders",
			icon: <BellRing size={20} />,
		},
		{
			label: "24/7 Priority Support",
			icon: <Headset size={20} />,
		},
	];
	// Handle purchase
	const handleContinue = async () => {
		await purchase(selectedPlan);
	};

	return (
		<section className="min-w-screen min-h-screen bg-text-primary/40 backdrop-blur-sm fixed z-50 inset-0 flex items-center justify-center">
			{/*  */}
			<div className="bg-bg-surface rounded-lg relative">
				{/* Cross btn */}
				<CloseButton onClick={onClose} />

				<div className="flex flex-col items-center justify-center text-center px-7 py-4 gap-y-2">
					{/*  */}
					<p>
						Unlock <strong className="text-brand-blue">Premium</strong> Features
					</p>

					{/*  */}
					<div className="flex items-center flex-row gap-x-2">
						<img
							src={GoogleMeetLogoSvg}
							className="w-11 h-11 drop-shadow-sm"
							alt="Meet Logo"
						/>
						<h1 className="max-w-90 text-2xl font-bold text-center">
							Join Google Meetings With Ease.
						</h1>
					</div>

					{/* Features showroom */}
					<div className=" w-full grid grid-cols-2 gap-x-4 gap-y-2 my-4">
						{featuredItems.map((item, idx) => (
							<div
								key={idx}
								className="w-full bg-brand-blue/10 rounded-lg flex flex-row items-center p-2 gap-x-4"
							>
								<span className="p-2 rounded-lg text-white bg-brand-blue">
									{item.icon}
								</span>
								<p className="font-semibold">{item.label}</p>
							</div>
						))}
					</div>

					{/* Plans Showroom — skeleton rows until the Store prices resolve */}
					<div className="w-full">
						{arePlansLoading &&
							[0, 1].map((idx) => (
								<div
									key={idx}
									aria-hidden="true"
									className="w-full h-[76px] bg-bg-elevated rounded-lg border-2 border-transparent animate-pulse mb-0.5"
								/>
							))}
						{!arePlansLoading && plans.map((plan) => (
							<button
								onClick={() => setSelectedPlan(plan.planCode)}
								key={plan.planCode}
								className={`w-full bg-bg-elevated flex flex-row justify-between items-center p-4 rounded-lg border-2 transition-colors ${plan.planCode === selectedPlan ? "bg-brand-blue/20 border-brand-blue " : "border-transparent hover:bg-brand-blue/10 active:bg-brand-blue/20 cursor-pointer "}`}
							>
								{/* Left */}
								<div className="flex flex-col text-left">
									<p className="text-lg font-semibold text-brand-blue">
										{plan.label}
									</p>
									<p className="text-sm font-semibold">{plan.slogan}</p>
								</div>
								{/* Right */}
								<div className="flex flex-col text-right">
									<p className="text-2xl font-bold">{plan.price}</p>
								</div>
							</button>
						))}
					</div>

					{/* Payment Info */}
					<div className="flex flex-row items-center">
						<ShieldCheck className="fill-brand-blue text-white" />
						<p className="text-sm">Secure Payment via Microsoft.</p>
					</div>

					{/* Submit */}
					<button
						onClick={handleContinue}
						disabled={isPurchasing || arePlansLoading}
						className="bg-brand-blue hover:opacity-90 active:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed text-white w-full py-3 rounded-lg text-lg font-semibold cursor-pointer"
					>
						<p>{isPurchasing ? "Processing..." : "Continue"}</p>
					</button>

					{/*  */}
					<p className="max-w-90 text-[12px] text-text-muted">
						Subscription will get auto-renewed if not disabled from Microsoft
						store or account.
					</p>

					{/*  */}
					<ul className="flex flex-row items-center gap-x-2">
						<button
							className="text-sm text-text-muted cursor-pointer hover:underline"
							onClick={async () => {
								await openUrl(SUPPORT_LINKS[2].url);
							}}
						>
							{SUPPORT_LINKS[2].label}
						</button>

						<li aria-hidden="true" className="text-text-muted">
							|
						</li>

						<button
							onClick={onClose}
							className="text-sm text-text-muted cursor-pointer hover:underline"
						>
							Continue without Subscription
						</button>

						<li aria-hidden="true" className="text-text-muted">
							|
						</li>

						<button
							className="text-sm text-text-muted cursor-pointer hover:underline"
							onClick={async () => {
								await openUrl(SUPPORT_LINKS[3].url);
							}}
						>
							{SUPPORT_LINKS[3].label}
						</button>
					</ul>
				</div>
			</div>
		</section>
	);
}
