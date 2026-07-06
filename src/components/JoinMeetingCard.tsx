// Imports
import React, { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { PrimaryButton } from "./ui/PrimaryButton";

//
export const JoinMeetingCard = () => {
  // States
  // Meeting url
  const [meetingLink, setMeetingLink] = useState<string>("");
  // Meeting Url Error
  const [isMeetingLinkError, setIsMeetingLinkError] = useState<boolean>(false);

  // handle inputs
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "meetingLink") {
      setIsMeetingLinkError(false);
      setMeetingLink(value);
    }
  };
  // handle meeting join
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (meetingLink.length > 0) {
      // Link regex
      const googleMeetLinkRegex =
        /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
      // Code regex
      const googleMeetCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
      // Validate link or code
      if (
        googleMeetLinkRegex.test(meetingLink) ||
        googleMeetCodeRegex.test(meetingLink)
      ) {
        //  For Link
        if (googleMeetLinkRegex.test(meetingLink)) {
          await openUrl(meetingLink);
        }

        // For Code
        if (googleMeetCodeRegex.test(meetingLink)) {
          await openUrl(`https://meet.google.com/${meetingLink}`);
        }
      } else {
        setIsMeetingLinkError(true);
      }
    } else {
      setIsMeetingLinkError(true);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        {/*  */}
        <p className="text-xl font-semibold">Join Meeting</p>
        {/*  */}
        <p className="text-text-muted">
          Create meeting with one click, join and share instantly.
        </p>
      </div>

      {/*  */}
      <input
        required
        name="meetingLink"
        onChange={handleInput}
        value={meetingLink}
        type="text"
        className={`bg-bg-elevated w-full border rounded-lg p-2 outline-none  ${isMeetingLinkError ? "border-red-500 placeholder:text-red-400 " : "border-border focus:border-blue-600"}`}
        placeholder={`${isMeetingLinkError ? "Google Meet Url or Code is required." : "📎 Paste your Meeting url or code."}`}
      />

      {/*  */}
      <PrimaryButton label="Join Meeting" onClick={handleSubmit} />
    </div>
  );
};
