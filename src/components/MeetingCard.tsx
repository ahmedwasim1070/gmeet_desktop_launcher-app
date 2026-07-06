// Imports
import { X } from "lucide-react";
import { ScheduleMeeting } from "../types";
import GoogleMeetLogoSvg from "../assets/g_meet-logo.svg";
// Assuming this path based on your prompt:
import { PrimaryButton } from "./ui/PrimaryButton";
import { openUrl } from "@tauri-apps/plugin-opener";

interface MeetingCardProps {
  meeting: ScheduleMeeting;
  currentTime: Date;
  onDelete: (serial: number) => void;
}

//
export const MeetingCard = ({
  meeting,
  currentTime,
  onDelete,
}: MeetingCardProps) => {
  // Merged TimeField Logic
  const processedDate = new Date(meeting.date);
  const isToday = processedDate.getDate() === currentTime.getDate();
  const isTomorrow = processedDate.getDate() === currentTime.getDate() + 1;

  const dateField = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : processedDate.toLocaleDateString();
  const timeString = processedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-[320px] shrink-0 bg-bg-surface rounded-xl p-5 relative border border-border/15 shadow-sm flex flex-col justify-between gap-y-4 transition-all hover:shadow-md">
      {/* Delete Button */}
      <button
        onClick={() => onDelete(meeting.serial)}
        className="p-1.5 bg-bg-base rounded-full absolute right-3 top-3 cursor-pointer hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header Info */}
      <div className="flex flex-row items-center gap-x-4 pr-6">
        <img
          src={GoogleMeetLogoSvg}
          className="w-11 h-11 drop-shadow-sm"
          alt="Meet"
        />
        <div className="text-left overflow-hidden">
          <p className="font-semibold text-lg text-text-primary truncate">
            {meeting.name}
          </p>
          <p className="text-sm font-medium text-text-muted truncate mt-0.5">
            {dateField} - {timeString}
          </p>
        </div>
      </div>

      {/* Reused Primary Button spanning full width of the card */}
      <div className="w-full mt-2">
        <PrimaryButton
          label="Join Now"
          onClick={async () => {
            await openUrl(meeting.url);
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};
