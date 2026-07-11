// Imports
import { openUrl } from "@tauri-apps/plugin-opener";
import { PrimaryButton } from "../ui/PrimaryButton";

// Card that opens a brand-new Google Meet in the browser
export const CreateMeetingCard = () => {
  return (
    <div className="space-y-4">
      <div>
        {/*  */}
        <p className="text-xl font-semibold">Create Meeting</p>
        {/*  */}
        <p className="text-text-muted">
          Create meeting with one click, join and share instantly.
        </p>
      </div>
      {/*  */}
      <PrimaryButton
        label="New Meeting"
        onClick={async () => {
          await openUrl("https://meet.google.com/new");
        }}
      />
    </div>
  );
};
