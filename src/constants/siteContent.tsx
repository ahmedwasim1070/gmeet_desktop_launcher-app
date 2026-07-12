// Imports
import {
	FileText,
	Hand,
	Mail,
	Star,
} from "lucide-react";

//
export const SUPPORT_LINKS = [
	{
		label: "Rate G-Meet Launcher",
		icon: <Star className="w-4 h-4" />,
		value: "rate-us",
		url: "ms-windows-store://review/?ProductId=9PHKS01R0C0B",
	},
	{
		label: "Contact support",
		icon: <Mail className="w-4 h-4" />,
		value: "contact-support",
		url:  "https://sites.google.com/view/ideaforge-web/support",
	},
	{
		label: "Terms of Service",
		icon: <FileText className="w-4 h-4" />,
		value: "terms-of-service",
		url: "https://sites.google.com/view/ideaforge-web/terms-of-service", 
	},
	{
		label: "Privacy Policy",
		icon: <Hand className="w-4 h-4" />,
		value: "privacy-policy",
		url: "https://sites.google.com/view/ideaforge-web/privacy-policy", 
	},
] as const;