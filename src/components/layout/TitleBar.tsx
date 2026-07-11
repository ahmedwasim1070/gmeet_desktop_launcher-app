// Imports
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import logoSvg from "../../assets/logo.svg";

const appWindow = getCurrentWindow();

// Custom window title bar (the app runs with native decorations disabled)
export const TitleBar = () => {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 select-none fixed top-0 left-0 w-full z-50 px-2 bg-bg-base"
    >
      {/* App Branding Area */}
      <div className="flex items-center gap-2 pointer-events-none">
        <img src={logoSvg} className="w-5 h-5" alt="App Logo" />
        <span className="text-sm font-semibold text-text-primary">
          G-Meet Desktop Launcher
        </span>
      </div>

      {/* OS System Control Buttons Layer */}
      <div className="flex h-full items-center">
        {/* Minimize Action Button */}
        <button
          type="button"
          onClick={() => appWindow.minimize()}
          className="h-full w-11 flex items-center justify-center text-text-muted hover:bg-gray-200 transition-colors duration-150 focus:outline-none"
        >
          <Minus className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Maximize / Restore Action Button */}
        <button
          type="button"
          onClick={() => appWindow.toggleMaximize()}
          className="h-full w-11 flex items-center justify-center text-text-muted hover:bg-gray-200 transition-colors duration-150 focus:outline-none"
        >
          {/* Sized slightly smaller to visually match the Windows restore icon weight */}
          <Square className="w-3.5 h-3.5" strokeWidth={2} />
        </button>

        {/* Close Action Button */}
        <button
          type="button"
          onClick={() => appWindow.close()}
          className="h-full w-11 flex items-center justify-center text-text-muted hover:bg-[#e81123] hover:text-white transition-colors duration-150 focus:outline-none"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
