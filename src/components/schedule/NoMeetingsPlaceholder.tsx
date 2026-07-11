// Imports
import { CalendarX } from "lucide-react";

// Placeholder shown when there are no upcoming meetings
export const NoMeetingsPlaceholder = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 bg-bg-surface rounded-xl border border-border/10 border-dashed">
      <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center mb-4">
        <CalendarX className="w-8 h-8 text-text-muted opacity-60" />
      </div>
      <p className="font-semibold text-xl text-text-primary">
        No Upcoming Meetings
      </p>
      <p className="text-sm text-text-muted mt-1">
        Enjoy your free time or schedule a new one!
      </p>
    </div>
  );
};
