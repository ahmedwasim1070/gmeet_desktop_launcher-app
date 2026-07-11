// Imports
import { Timer } from "lucide-react";

// Notice shown while the backgrounds feature is under construction
export function ComingSoonNotice() {
  return (
    <section className="min-w-full p-4 space-y-5">
      {/* Main Content Box */}
      <div className="w-full bg-bg-surface rounded-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        {/* Icon Wrapper */}
        <div className="p-4 bg-brand-blue/10 rounded-full">
          <Timer className="w-12 h-12 text-brand-blue animate-pulse" />
        </div>

        {/*  */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Coming Soon</h2>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            We are currently working on backgrounds. It will be available in a
            future update!
          </p>
        </div>

        <div className="pt-4">
          <span className="text-xs text-text-muted font-medium tracking-wider uppercase">
            Work in progress
          </span>
        </div>
      </div>
    </section>
  );
}
