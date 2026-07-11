// Imports
import { useState, useEffect } from "react";
import { Crown, Edit, Settings } from "lucide-react";
import { usePremiumServices } from "../services/AppServices";
import { SettingsPopup } from "../settings/SettingsPopup";

// Interface
interface GreetingsCardProps {
  formattedDate: string;
}

// Greeting header with the editable user name, upgrade action and settings
export const GreetingsCard = ({ formattedDate }: GreetingsCardProps) => {
  // Premium services (opens the plans popup)
  const { isPremium, openPremiumPopup } = usePremiumServices();

  // States
  // User Name
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("userName") || "User";
  });
  // Is Edit Bar
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  // Settings popup visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Saves to local storage
  useEffect(() => {
    if (userName !== "User") {
      localStorage.setItem("userName", userName);
    }
  }, [userName]);

  return (
    <div className="space-y-2">
      {/* Settings Popup */}
      {isSettingsOpen && (
        <SettingsPopup onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Top actions row — Upgrade to Pro (left) / Settings (right) */}
      <div className="flex flex-row items-center justify-between mb-3">
        {isPremium ? (
          <span className="flex flex-row items-center gap-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold">
            <Crown className="w-4 h-4" />
            Premium
          </span>
        ) : (
          <button
            onClick={openPremiumPopup}
            className="flex flex-row items-center gap-x-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold cursor-pointer hover:bg-brand-blue hover:text-white active:opacity-90 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </button>
        )}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg text-text-muted cursor-pointer hover:bg-bg-base hover:text-text-primary transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-x-1 text-xl font-bold">
        <p>Hey, </p>
        <p>👋</p>

        {/* Editable Name */}
        {isEditingName ? (
          <input
            onChange={(e) => setUserName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setIsEditingName(false);
              }
            }}
            type="text"
            className="max-w-20 border-b outline-none"
            value={userName}
            placeholder="Enter name"
          />
        ) : (
          <div className="flex flex-row items-center gap-x-2 max-w-90 ">
            <p>{userName}</p>
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsEditingName(true);
              }}
            >
              <Edit className="w-4 h-4 text-brand-blue" />
            </button>
          </div>
        )}
      </div>

      {/*  */}
      <p className="text-sm text-text-muted">{formattedDate}</p>
    </div>
  );
};
