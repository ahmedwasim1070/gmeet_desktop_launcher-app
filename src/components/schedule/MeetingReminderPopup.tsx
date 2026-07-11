// Imports
import { openUrl } from "@tauri-apps/plugin-opener";
import type { ScheduledMeeting } from "../../types";

// Interfaces
interface MeetingReminderPopupProps {
  meeting: ScheduledMeeting;
  onClose: () => void;
}

// Popup shown when a scheduled meeting's time arrives
export function MeetingReminderPopup({
  meeting,
  onClose,
}: MeetingReminderPopupProps) {
  // Handle Join
  const handleJoin = async () => {
    try {
      await openUrl(meeting.url);
    } catch (err) {
      console.error("Error in handleJoin in MeetingReminderPopup:", err);
    } finally {
      onClose();
    }
  };

  return (
    <section className="inset-0 fixed z-40 min-w-screen h-full bg-text-primary/30 flex justify-center items-center">
      {/*  */}
      <div className="bg-bg-surface shadow-sm rounded-lg w-1/4 flex flex-col items-center p-3 text-center">
        <p className="font-semibold text-lg text-text-primary">
          You have a Scheduled Meeting
        </p>

        {/*  */}
        <p className="text-brand-blue font-semibold">{meeting.name}</p>

        {/*  */}
        <p className="text-text-muted">{meeting.url}</p>

        {/*  */}
        <div className="w-full flex flex-row items-stretch gap-x-2 flex-nowrap mt-4">
          <button
            onClick={onClose}
            className="w-1/2 py-1 bg-bg-base border border-border/30 rounded-lg text-text-primary cursor-pointer hover:bg-bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="w-1/2 py-1 bg-brand-blue rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
          >
            {meeting.url === "https://meet.google.com/new" ? "Create" : "Join"}
          </button>
        </div>
      </div>
    </section>
  );
}
