// Imports
import { openUrl } from "@tauri-apps/plugin-opener";

// Interface
interface ClipboardMeetingPopupProps {
  meetingUrl: URL;
  onClose: () => void;
}

// Popup shown when a Google Meet link is detected on the clipboard
export function ClipboardMeetingPopup({
  meetingUrl,
  onClose,
}: ClipboardMeetingPopupProps) {
  // handle add or join
  const handleJoin = async () => {
    try {
      await openUrl(meetingUrl);
    } catch (err) {
      console.error("Error in handleJoin from ClipboardMeetingPopup:", err);
    } finally {
      onClose();
    }
  };

  return (
    <section
      onClick={onClose}
      className="inset-0 fixed z-40 min-w-screen h-full bg-text-primary/30 flex justify-center items-center"
    >
      {/*  */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-surface shadow-sm rounded-lg w-1/4 flex flex-col items-center p-3 text-center"
      >
        <p className="font-semibold text-lg text-text-primary">
          Add this meeting link ?
        </p>

        {/*  */}
        <p className="text-text-muted my-2">{meetingUrl.toString()}</p>

        {/*  */}
        <div className="w-full flex flex-row items-stretch gap-x-2 flex-nowrap mt-2">
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
            Join
          </button>
        </div>
      </div>
    </section>
  );
}
